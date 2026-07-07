# Deploying mploy (Oracle Cloud + Dokploy)

mploy (the MAC Jobs Board webapp) runs as a Docker container on an Oracle
Cloud VM, fronted by [Dokploy](https://dokploy.com). This mirrors the setup
used for our sibling repo `monmap`.

## Architecture: build off-box, run on-box

The Oracle VM is shared by several apps (monmap, mploy, monashcoding). A
Docker build peaks at 2–4 GB RAM and pegs the CPU; several racing on one box
is how you OOM production. So **we never build on the Oracle box**:

```
push to development ──▶ GitHub Actions (ubuntu-24.04-arm)
                        │  builds linux/arm64 image
                        ▼
                      GHCR: ghcr.io/monashcoding/mploy:latest
                        │  Dokploy pulls (webhook-triggered)
                        ▼
                      Oracle VM: `node server.js`  (~200–400 MB idle)
```

The box only ever runs the finished containers.

## This app's shape (why the config looks the way it does)

- The webapp is `frontend/` — a **self-contained npm app** (not a pnpm
  workspace), so the Docker **build context is `frontend/`** and deps install
  with `npm ci` from `frontend/package-lock.json`. The Spring Boot `backend/`
  is a separate service, not part of this image.
- Next.js is built with `output: "standalone"`; the runtime just runs
  `node server.js`. `outputFileTracingRoot` is pinned to `frontend/` so the
  standalone entrypoint always lands at `.next/standalone/server.js`.
- **Build-time vs runtime env.** The `NEXT_PUBLIC_*` vars (client auth URL +
  PostHog) are inlined into the client bundle, so they're passed as
  **build-args** (repo Variables → CI → Docker `ARG`). Everything else —
  secrets (`MONGODB_URI`, `NOTION_API_KEY`) and server-only config (`AUTH_URL`,
  `JWT_AUDIENCE`) — is a **runtime** env var set in Dokploy, never baked in.
  `next build` does **not** touch MongoDB (every DB-backed route is
  `force-dynamic` or reads `searchParams`), so no DB is needed to build.

## One-time GitHub setup

1. **Repo Variables** (Settings → Secrets and variables → Actions →
   _Variables_). All browser-public (they get inlined into the client bundle),
   so Variables not Secrets:
   - `NEXT_PUBLIC_AUTH_URL` = `https://auth.monashcoding.com`
   - `NEXT_PUBLIC_POSTHOG_HOST` = `https://us.i.posthog.com`
   - `NEXT_PUBLIC_POSTHOG_KEY` = _(PostHog project API key, `phc_…`)_
   The workflow has fallbacks for the first two; without the PostHog key,
   client analytics is simply disabled.
2. **Repo Secret** (Settings → Secrets and variables → Actions → _Secrets_):
   - `DOKPLOY_DEPLOY_WEBHOOK` = the deploy webhook URL Dokploy generates for
     the app (added after the Dokploy step below). Until it exists, the
     workflow builds/pushes the image but skips the redeploy trigger.
3. **Make the GHCR package public** (or give Dokploy a read token) so the VM
   can pull without auth: after the first push, open the package at
   `github.com/orgs/monashcoding/packages` → Package settings → change
   visibility to Public.

## One-time Dokploy setup

1. **Create Application** → Provider: **Docker**.
   - Image: `ghcr.io/monashcoding/mploy:latest`
   - (If you kept the package private: add GHCR registry credentials — a
     GitHub PAT with `read:packages`.)
2. **Environment** (runtime vars — server-side only):
   ```
   MONGODB_URI=mongodb+srv://<user>:<pass>@<atlas-cluster>/<db>
   MONGODB_DATABASE=default
   AUTH_URL=https://auth.monashcoding.com
   JWT_AUDIENCE=mac-suite
   NOTION_API_KEY=<notion integration token>
   NOTION_DATABASE_ID=<notion database id>
   ```
   Auth is the central MAC auth service; `AUTH_URL`/`JWT_AUDIENCE` are the
   server-side token-mint + JWKS-verification config (the client-side
   `NEXT_PUBLIC_AUTH_URL` is baked in at build time, above). MongoDB is hosted
   externally (Atlas), so `MONGODB_URI` is a normal `mongodb+srv://` string —
   no on-box private-IP caveat. Make sure the Atlas cluster's IP access list
   allows the Oracle VM's egress IP.
3. **Port**: container listens on `3000`.
4. **Domains**: add `jobs.monashcoding.com` → container port `3000` → enable
   HTTPS (Let's Encrypt).
   - DNS is on Cloudflare. **Grey-cloud (DNS-only)** the record first so
     Dokploy/Traefik can complete the Let's Encrypt HTTP-01 challenge and
     issue the cert, then switch it back to **orange-cloud (proxied)**
     afterwards.
5. **Deploy webhook**: copy the app's deploy webhook URL into the GitHub repo
   secret `DOKPLOY_DEPLOY_WEBHOOK` (GitHub setup step 1) so each pushed image
   auto-redeploys.

## Deploying a change

Push to `development`. GitHub Actions builds + pushes the image, then hits the
Dokploy webhook, which pulls and restarts the container. Watch the run under
the repo's Actions tab; watch the pull/restart in Dokploy.

To deploy manually: Actions → **Build & publish image** → _Run workflow_, then
hit **Deploy** in Dokploy.

## Notes

- `next build` does **not** touch MongoDB, so `MONGODB_URI` is a runtime-only
  var. The only build-args are the browser-public `NEXT_PUBLIC_*` values.
- The container runs as a non-root user (`nextjs`, uid 1001).
- The image is `linux/arm64` only — it runs on the Ampere A1 box and won't run
  on an x86 host without emulation.
