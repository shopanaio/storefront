# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim@sha256:c86ecead9e55a5210ac1727de38a4ca840bf03dcaf34dc9749addbf383b1920c AS build
WORKDIR /app

# Build from the workspace root with the theme checked out under themes/.
COPY . .
RUN corepack enable && yarn install --immutable && yarn cache clean --all

ARG STOREFRONT_THEME=brand-bite-crunch
ARG BUILD_NODE_OPTIONS=--max-old-space-size=4096
ENV NODE_ENV=production
# The static site is no part of the image: the coordinator (theme-static) renders it with this
# build into the bucket of the environment.
RUN yarn build:carrier && \
    NODE_OPTIONS="$BUILD_NODE_OPTIONS" STOREFRONT_THEME="$STOREFRONT_THEME" yarn build && \
    rm -rf "themes/$STOREFRONT_THEME/.runtime/build/static" && \
    test -f "themes/$STOREFRONT_THEME/.runtime/build/server/index.js"

FROM build AS production-dependencies
RUN THEME_PACKAGE=$(node -p "require('./themes/' + process.env.STOREFRONT_THEME + '/package.json').name") && \
    YARN_ENABLE_SCRIPTS=false yarn workspaces focus "$THEME_PACKAGE" --production && \
    yarn cache clean --all && \
    mkdir -p "themes/$STOREFRONT_THEME/node_modules"

FROM node:24-bookworm-slim@sha256:c86ecead9e55a5210ac1727de38a4ca840bf03dcaf34dc9749addbf383b1920c AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
WORKDIR /app
COPY --from=production-dependencies /app/node_modules ./node_modules
# Preserve the patch-package changes even if focusing dependencies relinks this package.
COPY --from=build /app/node_modules/antd-style ./node_modules/antd-style
ARG STOREFRONT_THEME=brand-bite-crunch
COPY --from=build /app/themes/${STOREFRONT_THEME}/package.json ./themes/${STOREFRONT_THEME}/package.json
COPY --from=production-dependencies /app/themes/${STOREFRONT_THEME}/node_modules ./themes/${STOREFRONT_THEME}/node_modules
COPY --from=build /app/themes/${STOREFRONT_THEME}/.runtime/build ./themes/${STOREFRONT_THEME}/.runtime/build
# Keep the production workspace targets of the node_modules links used by the hybrid server.
COPY --from=production-dependencies /app/packages/shopana-storefront-runtime ./packages/shopana-storefront-runtime
COPY --from=production-dependencies /app/packages/shopana-storefront-sdk ./packages/shopana-storefront-sdk
COPY --from=production-dependencies /app/packages/storefront-auth ./packages/storefront-auth
# The volume of the coordinator of the static site (theme-static): a new named volume takes the
# owner of the directory it is mounted on.
RUN mkdir -p /data && chown node:node /data
WORKDIR /app/themes/${STOREFRONT_THEME}
USER node
EXPOSE 3000
CMD ["node", "/app/packages/shopana-storefront-runtime/bin/storefront-runtime.js", "start"]
