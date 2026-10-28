# Apollo Client architecture

The storefront uses one Apollo lifecycle for SSR, hydration, client navigation,
cart and session. At the root, cart and session loaders share one request-scoped
server client (`getApolloRequestClient` of `@shopana/storefront-sdk/server/apollo`),
the request cookies and the same cache factory.

After the root queries finish, `loadAppProps` extracts one normalized cache
snapshot. Client-side stores read their initial values from that hydrated cache;
the GraphQL results are not serialized a second time in React props. A page adds
the snapshot of its `preload` through `ApolloCacheHydrator`.

The two runtimes differ only in who owns the clients:

- Next.js: `AppProvider` (a server component) loads the root data and `App` puts
  it in `ApolloNextAppProvider`, the streaming integration. The request client is
  registered with `registerApolloClient`.
- React Router: the root loader returns `loadAppProps()` and the runtime's
  `AppProvider` renders a plain `ApolloProvider`. Each request runs in a request
  scope (`server/requestScope`), whose client the loaders share; the server render
  reads the same client, and the browser starts from the root and page snapshots.
  A query that runs during the server render without a `preload` is not sent to
  the browser: its section loads it again there, so pages preload what they show
  above the fold.

GraphQL documents live in external `*.graphql` files. Components import
generated `TypedDocumentNode` values and generated operation/fragment types:

- theme documents generate the theme's own operations module
  (`themes/<name>/codegen/apollo/storefront-operations.ts`);
- checkout documents generate `packages/checkout/src/graphql/operations.ts`;
- SDK documents generate
  `packages/shopana-storefront-sdk/src/graphql/apollo/generated/operations.ts`.

Run the single project workflow after changing schema or documents:

```bash
CMS=shopana yarn codegen
```

The shared `createApolloCache` owns normalization and cursor connection merge
policies. `Category.products`, `Product.reviews` and `Query.searchProducts`
ignore cursor/window arguments, retain sort/filter identity arguments, replace
the connection on a cursor reset and deduplicate appended edges.

Apollo documents are also checked by the GraphQL ESLint override. It validates
schema fields and arguments, named and unique operations/fragments, variables,
fragment spreads and directives. The codegen preflight additionally rejects
Relay-only directives and fragments without `__typename`.

## Server loading

Page definitions load through `context.services.loadQuery` under both runtimes.
Under Next.js, use `createApolloNextClient` for RSC `PreloadQuery` flows;
imperative metadata and page loaders can use `createApolloServerQueryLoader` or
`loadSerializableQuery`; the latter returns serializable `{ data, variables,
cacheState }`.

## Compatibility hooks

The SDK entry point `@shopana/storefront-sdk/graphql/apollo` exports the thin
typed migration-friendly API:

- `useFragment`;
- `useLazyLoadQuery`;
- `usePreloadedQuery`;
- `usePaginationQuery` and pagination descriptors;
- `useMutation`;
- `fetchQuery`.

These hooks are Apollo-native and do not implement compiler directives,
fragment ownership or Relay Observable semantics.
