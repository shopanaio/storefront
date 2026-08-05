# @shopana/storefront-sdk

Infrastructure and shared domain primitives for Shopana storefront themes.

The SDK owns:

- Apollo client creation for server requests and the browser;
- the shared `createApolloCache()` policies for Shopana schema fields;
- serializable query loading and normalized cache extraction;
- initial page-snapshot hydration through `ApolloCacheHydrator`;
- generic `definePaginationQuery()` and `usePaginationQuery()` lifecycles;
- cart, session, mutations, shared domain entities, and Builder primitives.

The SDK does not own a theme's page queries, page data models, metadata,
providers, URL parameter semantics, or concrete pagination descriptors. Those
belong to the active theme and are supplied to the generic SDK APIs through
typed GraphQL documents.

## Apollo pagination

Create a descriptor next to the theme operation:

```ts
import { definePaginationQuery } from '@shopana/storefront-sdk/graphql/apollo';
import { ProductReviewsPaginationQueryDocument } from '@codegen/apollo/storefront-operations';

export const ProductReviewsPagination = definePaginationQuery({
  query: ProductReviewsPaginationQueryDocument,
  getConnection: (data) => data.product?.reviews,
  getNextVariables: ({ variables, count, endCursor }) => ({
    ...variables,
    first: count,
    after: endCursor,
  }),
});
```

`usePaginationQuery()` keeps the complete active variables for the current
logical list. A refetch resets `after` to `null`; subsequent `loadNext()` calls
continue with those refetched variables. Operation-variable identity is
canonicalized recursively, so object key order does not create a new logical
list.

The SDK cache registers connection semantics using real Shopana schema fields:

- `Category.products`, keyed by `sort` and `filters`;
- `Product.reviews`, keyed by `sort`;
- `Query.searchProducts`, keyed by `query`, `sort`, and `filters`.

Page and pagination operations can have different names. They share initial
results by selecting the same normalized parent, field arguments, connection
fragment, and node fragments.

## Page hydration

The runtime query service extracts one cumulative request snapshot. A theme
Provider applies it once before descendant Apollo hooks render:

```tsx
<ApolloCacheHydrator state={data.hydration.state}>
  {children}
</ApolloCacheHydrator>
```

The hydrator merges the current browser cache followed by the incoming page
snapshot. Incoming fields win, while browser records absent from the snapshot
remain intact. Ordinary rerenders do not replay the snapshot.

## Code generation

SDK GraphQL documents live only under `packages/shopana-storefront-sdk/src`.
The workspace `codegen` command acquires one root `schema.shopana.graphql`
artifact, then generates SDK and active-theme operations independently from
that same artifact. Generated files are never edited manually.
