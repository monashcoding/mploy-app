# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# mploy webapp — self-hosted image (Oracle Cloud + Dokploy).
#
# Build context is frontend/ (this directory). mploy's frontend is a
# self-contained npm app — NOT a pnpm workspace — so npm ci resolves
# everything from frontend/package-lock.json. The Spring Boot backend is a
# separate service and is not part of this image.
#
# NEXT_PUBLIC_* vars (client auth URL + PostHog) are inlined into the client
# bundle at build time, so they must be present as build ARGs. They're all
# browser-public values. Everything secret (MONGODB_URI, Notion keys) and all
# server-only config (AUTH_URL, JWT_AUDIENCE) is a *runtime* env var set in
# Dokploy — never a build arg. `next build` does NOT touch MongoDB (every DB
# route is force-dynamic or reads searchParams), so no DB is needed to build.
# ---------------------------------------------------------------------------

FROM node:22-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- deps ---------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- build --------------------------------------------------------------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* must exist at build time — they're inlined into the client
# bundle. Pass via --build-arg (Dokploy: Build → Build Args; CI: build-args).
ARG NEXT_PUBLIC_AUTH_URL
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ENV NEXT_PUBLIC_AUTH_URL=$NEXT_PUBLIC_AUTH_URL \
    NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY \
    NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST

RUN npm run build

# ---- runtime ------------------------------------------------------------
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Run as a non-root user.
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# `output: "standalone"` bundles server.js + its traced node_modules. Static
# assets and public/ aren't traced, so copy them alongside.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
