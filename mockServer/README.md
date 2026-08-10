# @shopana/mock-server

Reusable GraphQL mock engine for storefront themes. The package owns the
Storefront schema, resolvers, mutable in-memory state, mutation workflows, and
static image serving. It does not contain store data or theme assets.

## API

```js
import { createMockServer } from '@shopana/mock-server';

const server = await createMockServer({
  fixtures: {
    now: '2026-08-03T12:00:00.000Z',
    data: {
      categories: [],
      products: [],
      // The remaining Storefront state collections and singleton records.
    },
  },
  publicPath: '/absolute/path/to/theme/public',
});

await server.listen({ port: 4100 });
```

Open `/auth` on the same host to use the application-auth test page. The mock
implements the OpenAPI email/password sign-up, sign-in, sign-out, password
reset, session list, single-session revocation, and the OAuth
authorization-code/PKCE routes under
`/auth/applications/{applicationId}`. Users and sessions are isolated per
application ID and kept only in memory until the server restarts. OTP, email
delivery, policy enforcement, rate limiting, and other production IAM features
are intentionally not emulated.

The production storefront exchanges an OAuth access token for trusted customer
context before GraphQL execution. The mock keeps the same client-facing
boundary: an IAM application session authorizes the OAuth code flow, PKCE S256
is verified at token exchange, and only the resulting OAuth access token is
accepted as `Authorization: Bearer <token>` on `/graphql`.
Revoking or signing out an application session also revokes every authorization
code, access token, and refresh token issued from that session. IAM routes
support credentialed cross-origin requests from a separately hosted storefront.
The corresponding fixture customer is resolved by email, while a new sign-up
provisions a minimal in-memory customer. Revoking the session immediately
invalidates its Bearer token. Existing fixture customers can sign in with
`password123` (for example, `alex.morgan@example.com`).

The server listens on `0.0.0.0` by default. Pass `host` explicitly to restrict
it to a specific interface.

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

Authenticated requests normally use the Bearer token issued by application
auth. For fixture-only scenarios, `x-mock-customer-id` explicitly selects a
fixture customer and `x-mock-anonymous: true` forces an anonymous context.
Requests without either a Bearer token or an explicit mock customer are
anonymous. Checkout, customer, order, review, and question mutations update
only the in-memory store until the process restarts.

Product comparison fixtures are supplied as `data.productComparisons`, with a
`categoryId` and presentation `title`. Every product whose current primary
category matches the configured category is included; the engine selects its
first available variant. Optional `variantIds` override that selection for
specific products. Customer records may persist `comparisonVariantIds` and
`comparisonRevision`. The engine prepares product-page and customer comparison
matrices and implements the add, remove, and category-clear mutations.

Product recommendation fixtures are supplied as `data.productRecommendations`.
Each record identifies its source `productId` and contains ordered
`relatedProducts` and `frequentlyBoughtTogether` arrays. Recommendation entries
contain a `productId` and a `ProductRecommendationSource` value. Missing target
products are omitted when the connection is resolved, and both fields support
forward pagination through `first` and `after`.

## Engine boundaries

- `src/server.js` creates the GraphQL and HTTP servers from injected data.
- `src/mock-store.js` clones and indexes the injected theme state.
- `src/resolvers.js` implements schema resolution and relationship hydration.
- `src/mutations/` contains mutable Storefront workflows.
- `src/fixture-helpers.js` contains data constructors shared with themes.

The engine must not import a theme package or a theme-owned fixture module.
