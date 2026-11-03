# Shopana Storefront

Packages for building storefronts on the [Shopana](https://github.com/shopanaio) storefront API.
A storefront is a theme: a complete runnable application composed from these packages, built with
Next.js (App Router) or React Router (framework mode, the React line of Remix) from the same theme
code.

> **Status: beta.** APIs may change between minor versions until 1.0.

## Packages

| Package                                                      | Description                                        |
| ------------------------------------------------------------ | -------------------------------------------------- |
| [`@shopana/storefront`](packages/shopana-storefront-runtime) | Next.js and React Router runtimes, CLI and facades |
| [`@shopana/storefront-sdk`](packages/shopana-storefront-sdk) | Data, session, cart and composition primitives     |
| [`@shopana/storefront-auth`](packages/storefront-auth)       | Headless customer sign-in and sign-up              |
| [`@shopana/storefront-ui`](packages/storefront-ui)           | Form and overlay primitives                        |
| [`@shopana/checkout`](packages/checkout)                     | Checkout flow and registration API                 |
| [`@shopana/brand-sdk`](packages/brand-sdk) (private)         | Theme contract                                     |
| [`@shopana/mock-server`](mockServer) (private)               | GraphQL mock engine for theme development          |

## Requirements

- Node.js 22 (see `.nvmrc`)
- Yarn 1

## Setup

```bash
yarn install
yarn build:packages
```

## Themes

Themes are separate repositories checked out under `themes/<name>`; see
[themes/README.md](themes/README.md) and [docs/brand-configuration.md](docs/brand-configuration.md).
With a theme checked out, the root commands run it:

```bash
yarn runtime:init
yarn dev
yarn build
yarn start
yarn storybook:theme
```

`runtime:init` generates the theme's `.runtime` directory for the framework of the theme
(`storefront.framework` in its `package.json`: `next`, the default, or `react-router`). Generated
runtime files must not be edited directly.

## Docker deployment

The root `Dockerfile` builds the checked-out React Router theme, including its widgets,
and runs its production SSR server as the unprivileged `node` user on port 3000.
The default theme is `brand-bite-crunch`; select another React Router theme with
`--build-arg STOREFRONT_THEME=<directory-name>`.

The image contains no deployment keys or URLs. Build it once from the workspace root:

```bash
docker build -t shopana-theme .
docker run --rm --init -p 3000:3000 --env-file /path/to/runtime.env shopana-theme
```

Provide `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_GRAPHQL_URL`, `NEXT_PUBLIC_API_KEY`, and optional
`NEXT_PUBLIC_PET_ASSISTANT_URL`, `NEXT_PUBLIC_IAM_URL`, `NEXT_PUBLIC_IAM_APPLICATION_ID`,
`NEXT_PUBLIC_CART_COOKIE_NAME`, `NEXT_PUBLIC_STOREFRONT_COOKIE_POLICY` at **runtime**.
Only a PUBLIC Headless token belongs in `NEXT_PUBLIC_API_KEY`.
The SSR server sends public settings in the HTML before browser modules execute; private
`IAM_OAUTH_*` and `STOREFRONT_SESSION_SECRET` settings stay on the server.
Changing a key or URL requires restarting/updating the container, never rebuilding the image.

For customer login also provide `IAM_OAUTH_CLIENT_ID`, `IAM_OAUTH_CLIENT_SECRET`,
`IAM_OAUTH_RESOURCE`, `IAM_OAUTH_REDIRECT_URI`, `IAM_OAUTH_POST_LOGOUT_REDIRECT_URI`
and a `STOREFRONT_SESSION_SECRET` of at least 32 characters. Keep runtime.env outside the
build context. Local `.env` files are excluded from the image.

The build uses a 4 GiB Node.js heap; override it with `--build-arg BUILD_NODE_OPTIONS=...`
when needed. Allocate enough memory and disk space to the builder. The container must reach
its configured API and IAM services; `localhost` inside it refers to the container itself.

Cloudflare Tunnel, same-origin API routing, Free CDN/WAF rules and Swarm deployment profiles:
see [deploy/README.md](deploy/README.md).

## Development

```bash
yarn lint           # ESLint
yarn format:check   # Prettier
yarn typecheck      # builds the packages, then type-checks every workspace
yarn test           # unit tests of the packages
yarn storybook      # Storybook of the packages
yarn codegen        # regenerates GraphQL and OpenAPI types (needs SHOPANA_GRAPHQL_URL)
```

See [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

[Apache-2.0](LICENSE)
