# syntax=docker/dockerfile:1

ARG NODE_VERSION=22-bookworm-slim

# --------------------------------------------
# Dependências
# --------------------------------------------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# --------------------------------------------
# Build (prisma generate + next build)
# --------------------------------------------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Placeholders só para o build (prisma generate / import de lib/prisma.ts).
# Segredos reais entram em runtime na Had Cloud, não como ARG.
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/postgres"
ENV DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:5432/postgres"
ENV BETTER_AUTH_SECRET="build-placeholder"
ENV BETTER_AUTH_URL="http://localhost:3000"
ENV ALLOW_PUBLIC_SIGN_UP="false"

RUN npm run build

# --------------------------------------------
# Migrations (opcional): docker build --target migrator
# --------------------------------------------
FROM node:${NODE_VERSION} AS migrator
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

CMD ["npx", "prisma", "migrate", "deploy"]

# --------------------------------------------
# Runtime standalone
# --------------------------------------------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/public ./public
RUN mkdir .next && chown node:node .next
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000

CMD ["node", "server.js"]
