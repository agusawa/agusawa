# syntax=docker/dockerfile:1.4
FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm@11.7.0

# ── Build ──────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/til/package.json apps/til/package.json

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter til

COPY apps/til ./apps/til

RUN pnpm --filter til build

# ── Serve ──────────────────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

COPY apps/til/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/til/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
