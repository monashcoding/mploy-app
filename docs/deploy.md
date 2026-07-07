# Deploying mploy (Oracle Cloud + Dokploy)

mploy (the MAC Jobs Board webapp) runs as a Docker container on an Oracle
Cloud VM, fronted by [Dokploy](https://dokploy.com). This mirrors the setup
used for our sibling repo `monmap`.

## Architecture: build off-box, run on-box

The Oracle VM is shared by several apps (monmap, mploy, monashcoding). A
Docker build peaks at 2–4 GB RAM and pegs the CPU; several racing on one box
is how you OOM production. So **we never build on the Oracle box**:

```
push to production ──▶ GitHub Actions (ubuntu-24.04-arm)
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
- **No build-time vars.** There are no `NEXT_PUBLIC_*` values (the Google
  Analytics id is hardcoded), and `next build` does **not** touch MongoDB —
  every DB-backed route is `force-dynamic` or reads `searchParams`, so nothing
  is prerendered against the database. Everything below is therefore a
  **runtime** env var set in Dokploy; nothing is baked into the image.

## One-time GitHub setup

1. **Repo Secret** (Settings → Secrets and variables → Actions → _Secrets_):
   - `DOKPLOY_DEPLOY_WEBHOOK` = the deploy webhook URL Dokploy generates for
     the app (added after the Dokploy step below). Until it exists, the
     workflow builds/pushes the image but skips the redeploy trigger.
2. **Make the GHCR package public** (or give Dokploy a read token) so the VM
   can pull without auth: after the first push, open the package at
   `github.com/orgs/monashcoding/packages` → Package settings → change
   visibility to Public.

There are no repo _Variables_ to set — the build takes no build-args.

## One-time Dokploy setup

1. **Create Application** → Provider: **Docker**.
   - Image: `ghcr.io/monashcoding/mploy:latest`
   - (If you kept the package private: add GHCR registry credentials — a
     GitHub PAT with `read:packages`.)
2. **Environment** (runtime vars):
   ```
   MONGODB_URI=mongodb+srv://<user>:<pass>@<atlas-cluster>/<db>
   MONGODB_DATABASE=default
   NEXTAUTH_SECRET=<random secret>
   NEXTAUTH_URL=https://jobs.monashcoding.com
   GOOGLE_CLIENT_ID=<oauth client id>
   GOOGLE_CLIENT_SECRET=<oauth client secret>
   NOTION_API_KEY=<notion integration token>
   NOTION_DATABASE_ID=<notion database id>
   ```
   MongoDB is hosted externally (Atlas), so `MONGODB_URI` is a normal
   `mongodb+srv://` connection string — no on-box private-IP caveat. Make sure
   the Atlas cluster's IP access list allows the Oracle VM's egress IP.
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

Push to `production`. GitHub Actions builds + pushes the image, then hits the
Dokploy webhook, which pulls and restarts the container. Watch the run under
the repo's Actions tab; watch the pull/restart in Dokploy.

To deploy manually: Actions → **Build & publish image** → _Run workflow_, then
hit **Deploy** in Dokploy.

## Notes

- `next build` does **not** touch MongoDB, so `MONGODB_URI` is a runtime-only
  var. There are no build-args at all.
- The container runs as a non-root user (`nextjs`, uid 1001).
- The image is `linux/arm64` only — it runs on the Ampere A1 box and won't run
  on an x86 host without emulation.
