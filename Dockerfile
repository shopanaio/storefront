# syntax=docker/dockerfile:1.7

# Multi-stage build for the Bite & Crunch theme application
# - Build-time CMS: shopana (default)
# - GraphQL URL defaults to Traefik path: /api/client/graphql/query
# - Build-time app URL: NEXT_PUBLIC_APP_URL
# - Pass SHOPANA_API_KEY at build time if required by backend

ARG NODE_VERSION=22.21.1

FROM node:${NODE_VERSION}-alpine AS base
ENV CI=1
WORKDIR /app

# Common deps for Next.js build on Alpine
RUN apk add --no-cache libc6-compat

# ---------- deps ----------
FROM base AS deps

# Only copy manifests to maximize layer caching
COPY package.json yarn.lock ./
COPY packages ./packages

RUN yarn install

# ---------- builder ----------
FROM base AS builder

# Build-time arguments for CMS configuration
ARG CMS=shopana
ARG SHOPANA_GRAPHQL_URL=/api/client/graphql/query
ARG SHOPANA_API_KEY
ARG NEXT_PUBLIC_APP_URL
ARG PORT=3000

# Ensure env is visible while the runtime CLI builds Next.js
ENV CMS=${CMS}
ENV SHOPANA_GRAPHQL_URL=${SHOPANA_GRAPHQL_URL}
ENV SHOPANA_API_KEY=${SHOPANA_API_KEY}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV PORT=${PORT}

COPY --from=deps /app/node_modules ./node_modules

# Copy rest of the source
COPY . .

# Build the selected runnable theme workspace.
RUN yarn workspace @shopana/brand-sdk build && yarn workspace @shopana/brand-bite-crunch build

# ---------- runner ----------
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Re-declare build args needed at runtime
ARG CMS=shopana

# Runtime deps only
RUN apk add --no-cache libc6-compat

# Copy minimal runtime files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
# Default Next.js port; Traefik will route to this
ENV PORT=3000
EXPOSE 3000

# CMS defaults for runtime (used by start script flags/logs; build-time env embeds actual endpoints)
ENV CMS=${CMS}

CMD ["yarn", "workspace", "@shopana/brand-bite-crunch", "start"]
