# syntax=docker/dockerfile:1.4
# Build from the repo root: docker build -f apps/careerbreak/Dockerfile .
FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm@11.7.0

# ── Build ──────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/careerbreak/package.json apps/careerbreak/package.json

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter careerbreak

COPY apps/careerbreak ./apps/careerbreak

# Baked into the client bundle at build time: set these as build args in Dokploy.
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY \
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID \
    NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID

RUN pnpm --filter careerbreak build

# ── Run ────────────────────────────────────────────────────────────────────────
# Runtime env (set in Dokploy): MONGODB_URI, ALLOWED_EMAIL,
# FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0

RUN addgroup -S app && adduser -S app -G app
COPY --from=builder --chown=app:app /app/apps/careerbreak/.next/standalone ./
COPY --from=builder --chown=app:app /app/apps/careerbreak/.next/static ./apps/careerbreak/.next/static
USER app

EXPOSE 3000

CMD ["node", "apps/careerbreak/server.js"]
