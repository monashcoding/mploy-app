# -------------------------
# Base
# -------------------------
FROM node:20-alpine AS base
WORKDIR /app

# -------------------------
# Dependencies
# -------------------------
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# -------------------------
# Builder
# -------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* ./
COPY tsconfig.json next.config.ts ./
COPY postcss.config.mjs tailwind.config.ts ./
COPY public ./public
COPY src ./src
RUN npm run build

# -------------------------
# Runner
# -------------------------
FROM base AS runner
WORKDIR /app

# Default: prod, can override with `-e NODE_ENV=development`
ENV NODE_ENV=production

# Copy runtime deps
COPY --from=deps /app/node_modules ./node_modules

# Copy built assets
COPY --from=builder --chown=1001:1001 /app/.next/standalone ./
COPY --from=builder --chown=1001:1001 /app/.next/static ./.next/static
COPY --from=builder --chown=1001:1001 /app/public ./public

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["npm", "start"]
