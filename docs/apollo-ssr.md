# Apollo Client architecture

`AppProvider` uses one Apollo lifecycle for SSR, hydration, client navigation,
cart and session. The browser client is owned by `ApolloNextAppProvider`.
At the root, cart and session loaders share one request-scoped server client,
the request cookies and the same cache factory.

After the root queries finish, `AppProvider` extracts one normalized cache
snapshot. Client-side stores read their initial values from that hydrated cache;
the GraphQL results are not serialized a second time in React props.

GraphQL documents live in external `*.graphql` files. Components import
generated `TypedDocumentNode` values and generated operation/fragment types:

- storefront documents generate `codegen/apollo/storefront-operations.ts`;
- SDK documents generate
  `packages/shopana-storefront-sdk/src/graphql/apollo/generated/operations.ts`.

Run the single project workflow after changing schema or documents:

```bash
CMS=shopana npm run codegen
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

Use `createApolloNextClient` for RSC `PreloadQuery` flows. Imperative metadata
and page loaders can use `createApolloServerQueryLoader` or
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
