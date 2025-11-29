# syntax=docker/dockerfile:1.7

# Multi-stage build for Next.js 14 (Shopana Storefront)
# - Build-time CMS: shopana (default)
# - GraphQL URL defaults to Traefik path: /api/client/graphql/query
# - Build-time app URL: NEXT_PUBLIC_APP_URL
# - Pass SHOPANA_API_KEY at build time if required by backend

ARG NODE_VERSION=22.21.1

FROM node:${NODE_VERSION}-alpine AS base
ENV CI=1
WORKDIR /app

# Common deps for Next.js build on Alpine
RUN apk add --no-cache libc6-compat yarn

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
ARG BRAND=default
ARG SHOPANA_GRAPHQL_URL=/api/client/graphql/query
ARG SHOPANA_API_KEY
ARG NEXT_PUBLIC_APP_URL
ARG PORT=3000

# Ensure env visible during `next build`
ENV CMS=${CMS}
ENV BRAND=${BRAND}
ENV SHOPANA_GRAPHQL_URL=${SHOPANA_GRAPHQL_URL}
ENV SHOPANA_API_KEY=${SHOPANA_API_KEY}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV PORT=${PORT}

COPY --from=deps /app/node_modules ./node_modules

# Copy rest of the source
COPY . .

# Build workspace packages first, then the Next.js app
# Ensures packages under `packages/*` are compiled (dist) for production
RUN yarn workspaces run build && yarn build

# ---------- runner ----------
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Runtime deps only
RUN apk add --no-cache libc6-compat

# Copy minimal runtime files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/bin ./bin
COPY --from=builder /app/relay.shopana.json ./relay.shopana.json
COPY --from=builder /app/relay.shopify.json ./relay.shopify.json


# Default Next.js port; Traefik will route to this
ENV PORT=3000
EXPOSE 3000

# CMS defaults for runtime (used by start script flags/logs; build-time env embeds actual endpoints)
ENV CMS=${CMS}

CMD ["yarn", "start"]
