## Shopana Storefront UI

### Links

- [Next.js 14](https://nextjs.org/)
- [Ant Design v5](https://ant.design/components/overview/)
- [Ant Design CSS-in-JS](https://github.com/ant-design/antd-style)
- [Ant Design Style](https://github.com/ant-design/antd-style)
- [Relay](https://relay.dev/)

## What it is

A storefront template built with Next.js 14 + Relay that can work with two CMS providers: Shopana and Shopify. Below is a beginner-friendly, step-by-step guide on how to set up the environment, generate schemas/types, compile Relay, and run the project for a specific CMS.

## Requirements

- Node.js ≥ 18.17
- Yarn (recommended)

## Installation

```bash
git clone <your-fork-or-repo-url>
cd storefront-ui
yarn install
```

## Environment variables (.env)

Copy `.env.sample` to `.env` at the project root and choose one of the options depending on the CMS.

### Shopana

```bash
SHOPANA_GRAPHQL_URL="https://sandbox.shopana.io/api/client/graphql/query"
SHOPANA_API_KEY="your-shopana-api-key"
```

### Shopify

```bash
SHOPIFY_GRAPHQL_URL="https://your-store.myshopify.com/api/2025-07/graphql.json"
SHOPIFY_API_KEY="your-shopify-storefront-access-token"
```

## Generate GraphQL schema and types

These commands perform API introspection and save the schema to `schema.shopana.graphql` or `schema.shopify.graphql`, and generate TypeScript types in `codegen/schema-client.ts` (Shopana) and/or `codegen/shopify-storefront-api.ts` (Shopify):

```bash
yarn codegen:shopana
yarn codegen:shopify
```

Important: the commands read variables from `.env`. Make sure you set correct values for the chosen provider.

## Compile Relay artifacts

The Relay compiler reads `relay.<cms>.json` configs and generates `__generated__` artifacts next to GraphQL operations.

```bash
# For Shopana
yarn relay:shopana

# For Shopify
yarn relay:shopify
```

In dev scripts, this command is run automatically before the server starts.

## Run in development mode

```bash
# Shopana
yarn dev:shopana

# Shopify
yarn dev:shopify
```

What `yarn dev:<cms>` does:

- compiles Relay for the selected CMS;
- runs `next dev` with `CMS=<cms>`;
- uses `NEXT_PUBLIC_*` variables from `.env` for the Relay network layer (see `src/relay/Environment.ts`).

## Switching between CMS

1. Update `.env` for the new CMS (URL, keys).
2. Regenerate schema and types: `yarn codegen:<cms>`.
3. Rebuild Relay artifacts: `yarn relay:<cms>`.
4. Restart the dev server (`yarn dev:<cms>`) or rebuild for production.

## Storybook

```bash
yarn storybook
```

##

TODO:

- * Cart replacing item (replace box / show color on the button)

- Show box in the cart as a separate item
- product activity no app bar
- image skeleton with pretty svg and size
- Mobile Search only on the home plage
- np api

- * Cover Dropdown option

- make decimal number - calculate sale and groups on fe
- pg search
