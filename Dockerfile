# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim@sha256:c86ecead9e55a5210ac1727de38a4ca840bf03dcaf34dc9749addbf383b1920c AS build
WORKDIR /app

# Build from the workspace root with the theme checked out under themes/.
COPY . .
RUN corepack enable && yarn install --immutable && yarn cache clean --all

ARG STOREFRONT_THEME=brand-bite-crunch
ARG BUILD_NODE_OPTIONS=--max-old-space-size=4096
ENV NODE_ENV=production
# The static site the workflow generated before this build (`storefront-runtime static build`
# into .runtime/build/static) is kept aside while the theme builds again. It carries the assets
# its pages name, so a page of it hydrates whatever hashes this build gives. Without one the
# image renders every page.
RUN mkdir -p /static && \
    if [ -d "themes/$STOREFRONT_THEME/.runtime/build/static" ]; then \
      mv "themes/$STOREFRONT_THEME/.runtime/build/static" /static/static; \
    fi
RUN NODE_OPTIONS="$BUILD_NODE_OPTIONS" STOREFRONT_THEME="$STOREFRONT_THEME" yarn build && \
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
COPY --from=build /static/ ./themes/${STOREFRONT_THEME}/.runtime/build/
# The hybrid server (`storefront-runtime start`): the workspace link of @shopana/storefront in
# node_modules points here.
COPY --from=build /app/packages/shopana-storefront-runtime/package.json ./packages/shopana-storefront-runtime/package.json
COPY --from=build /app/packages/shopana-storefront-runtime/bin ./packages/shopana-storefront-runtime/bin
COPY --from=build /app/packages/shopana-storefront-runtime/dist ./packages/shopana-storefront-runtime/dist
COPY --from=build /app/packages/shopana-storefront-runtime/src/init.js ./packages/shopana-storefront-runtime/src/init.js
WORKDIR /app/themes/${STOREFRONT_THEME}
USER node
EXPOSE 3000
CMD ["node", "/app/packages/shopana-storefront-runtime/bin/storefront-runtime.js", "start"]
