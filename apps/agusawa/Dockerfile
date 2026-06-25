# syntax=docker/dockerfile:1.4
FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm@11.7.0

# ── Build ──────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/agusawa/package.json apps/agusawa/package.json

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter agusawa

COPY apps/agusawa ./apps/agusawa

RUN pnpm --filter agusawa build

# ── Serve ──────────────────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

COPY apps/agusawa/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/agusawa/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
