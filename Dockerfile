# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS build
WORKDIR /app

# Build from the workspace root with the theme checked out under themes/.
COPY . .
RUN corepack enable && yarn install --immutable && yarn cache clean --all

ARG STOREFRONT_THEME=brand-bite-crunch
ARG NEXT_PUBLIC_GRAPHQL_URL
ARG NEXT_PUBLIC_API_KEY
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_PET_ASSISTANT_URL
ARG NEXT_PUBLIC_IAM_URL
ARG NEXT_PUBLIC_IAM_APPLICATION_ID
ARG NEXT_PUBLIC_CART_COOKIE_NAME=shopana_cart_id
ARG NEXT_PUBLIC_STOREFRONT_COOKIE_POLICY=first-party
ARG BUILD_NODE_OPTIONS=--max-old-space-size=4096
ENV NODE_ENV=production
RUN test -n "$NEXT_PUBLIC_GRAPHQL_URL" && test -n "$NEXT_PUBLIC_API_KEY" && \
    NODE_OPTIONS="$BUILD_NODE_OPTIONS" STOREFRONT_THEME="$STOREFRONT_THEME" yarn build && \
    test -f "themes/$STOREFRONT_THEME/.runtime/build/server/index.js"

FROM build AS production-dependencies
RUN THEME_PACKAGE=$(node -p "require('./themes/' + process.env.STOREFRONT_THEME + '/package.json').name") && \
    YARN_ENABLE_SCRIPTS=false yarn workspaces focus "$THEME_PACKAGE" --production && \
    yarn cache clean --all && \
    mkdir -p "themes/$STOREFRONT_THEME/node_modules"

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    NODE_OPTIONS=--import=/app/forwarded-for.mjs
WORKDIR /app
COPY --from=production-dependencies /app/node_modules ./node_modules
# Preserve the patch-package changes even if focusing dependencies relinks this package.
COPY --from=build /app/node_modules/antd-style ./node_modules/antd-style
ARG STOREFRONT_THEME=brand-bite-crunch
COPY --from=build /app/themes/${STOREFRONT_THEME}/package.json ./themes/${STOREFRONT_THEME}/package.json
COPY --from=production-dependencies /app/themes/${STOREFRONT_THEME}/node_modules ./themes/${STOREFRONT_THEME}/node_modules
COPY --from=build /app/themes/${STOREFRONT_THEME}/.runtime/build ./themes/${STOREFRONT_THEME}/.runtime/build
COPY --from=build /app/packages/shopana-storefront-runtime/bin/forwarded-for.js ./forwarded-for.mjs
WORKDIR /app/themes/${STOREFRONT_THEME}/.runtime
USER node
EXPOSE 3000
CMD ["node", "/app/node_modules/@react-router/serve/bin.cjs", "build/server/index.js"]
