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
