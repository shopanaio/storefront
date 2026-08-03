# @shopana/mock-server

Standalone GraphQL mock server based on the storefront federation supergraph schema.

The server implements the complete Storefront schema over the bundled fixtures. It
includes Relay pagination, product search/filtering/sorting, catalog relationship
hydration, customer-scoped data, checkout and order workflows, and reviews and
questions mutations.

## Run

```sh
yarn install
yarn start
```

The GraphQL endpoint and GraphiQL are available at:

```text
http://127.0.0.1:4100/graphql
```

Use `PORT` and `HOST` to override the defaults:

```sh
PORT=4200 HOST=0.0.0.0 yarn start
```

For development with automatic restart:

```sh
yarn dev
```

## Request context

The first fixture customer (`Alex Morgan`) is the authenticated customer by
default. Select another fixture customer by sending either its global ID, fixture
key, or email address in the `x-mock-customer-id` header:

```text
x-mock-customer-id: jamie-chen
```

Use an anonymous storefront context with:

```text
x-mock-anonymous: true
```

This affects `Query.customer`, ownership-protected order and review fields, and
all customer-authenticated mutations.

## Mutable mock state

All fixture records are cloned into an in-memory store at startup. Mutations update
that isolated copy, so checkout/cart state, customers, orders, returns, reviews,
questions, answers, subscriptions, votes, and reports remain available to later
requests while the process is running. Restarting the server resets all state back
to the fixtures.

Checkout and order mutations implement the schema's optimistic concurrency inputs.
Mutation idempotency keys are cached per operation, so replaying a request returns
the original result. Runtime entities use stable `gid://shopana/<Type>/<value>` IDs
and are available through relationship fields and `Query.node` when their type
implements `Node`.

The reusable mock infrastructure lives in:

- `src/helpers.js` — Relay connections, cursors, listing filters and sorts,
  errors, addresses, and checkout-line factories;
- `src/mock-store.js` — fixture cloning, entity indexing, request identity,
  deterministic timestamps, counters, and idempotency storage;
- `src/resolvers.js` — root resolvers, generic `*Id`/`*Ids` hydration, abstract
  types, and domain relationship resolvers;
- `src/mutations/` — checkout, customer/order, and review mutation workflows.

## Mock images and data

[DummyJSON Products](https://dummyjson.com/docs/products) is the recommended
starting point for product fixtures. It provides products, categories, prices,
descriptions, thumbnails, and image galleries.

Useful alternatives:

- [Lorem Picsum](https://picsum.photos/) for seeded photos, for example
  `https://picsum.photos/seed/product-1/800/800`.
- [DummyJSON Image](https://dummyjson.com/docs/image) for generated placeholders
  with controlled dimensions, colors, and labels.
- [Unsplash](https://unsplash.com/) for realistic photos, subject to its usage
  terms.

Do not rely on remote image URLs in stable fixtures. Download selected images
once and keep them in the mock server so that local development, offline use,
and screenshot tests are deterministic. Use the following asset structure:

```text
public/
  images/
    products/
    categories/
    avatars/
    reviews/
    placeholders/
```

Store fixture records under `src/fixtures/` and reference the corresponding
local image URLs from those records. Files under `public/images/` are served by
the mock server at `/images/*`.

The bundled `Northstar Supply` demo dataset is documented in
[`src/fixtures/README.md`](src/fixtures/README.md). It covers catalog, media,
markets, customers, checkout, orders, returns, reviews, questions, and Online
Store content.
