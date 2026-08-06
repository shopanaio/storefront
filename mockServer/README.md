# @shopana/mock-server

Reusable GraphQL mock engine for storefront themes. The package owns the
Storefront schema, resolvers, mutable in-memory state, mutation workflows, and
static image serving. It does not contain store data or theme assets.

## API

```js
import { createMockServer } from "@shopana/mock-server";

const server = await createMockServer({
  fixtures: {
    now: "2026-08-03T12:00:00.000Z",
    data: {
      categories: [],
      products: [],
      // The remaining Storefront state collections and singleton records.
    },
  },
  publicPath: "/absolute/path/to/theme/public",
});

await server.listen({ host: "127.0.0.1", port: 4100 });
```

`createMockServer` returns the Node HTTP server, the cloned mutable store, and
promise-based `listen` and `close` methods. Each server instance clones the
supplied fixture data, so mutations never change the theme's source objects.

Fixture constructors such as `gid`, `money`, `richText`, `postalAddress`, and
`contentMetrics` are available from `@shopana/mock-server/fixture-helpers`.

## Theme composition

The theme owns the executable entrypoint, fixture bundle, deterministic clock,
and files served from `/images/*`. Bite & Crunch composes the engine in
`packages/brand-bite-crunch/mock/server.js` and stores its fixture data under
`packages/brand-bite-crunch/mock/fixtures/`.

The request headers `x-mock-customer-id` and `x-mock-anonymous` control the
fixture customer used for the request. Checkout, customer, order, review, and
question mutations update only the in-memory store until the process restarts.

## Engine boundaries

- `src/server.js` creates the GraphQL and HTTP servers from injected data.
- `src/mock-store.js` clones and indexes the injected theme state.
- `src/resolvers.js` implements schema resolution and relationship hydration.
- `src/mutations/` contains mutable Storefront workflows.
- `src/fixture-helpers.js` contains data constructors shared with themes.

The engine must not import a theme package or a theme-owned fixture module.
