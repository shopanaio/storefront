# Apollo UI and Next.js SSR

Apollo and Relay run in parallel. `AppProvider` mounts
`ApolloNextAppProvider` outside the existing `RelayEnvironmentProvider`; no
existing Relay query or component needs to change.

## Runtime structure

```text
AppProvider (RSC)
└── App (Client Component)
    └── ApolloNextAppProvider
        └── RelayEnvironmentProvider
            └── existing application providers
```

The Apollo core lives in two layers:

- `graphql/apollo` contains the environment, authenticated link, cache factory
  and imperative serializable loader.
- `next/apollo` contains the App Router provider, request-scoped RSC client,
  `PreloadQuery` integration and client hooks.

## Create the request-scoped server client

Create one server-only module for the application. Do not create a global
`ApolloClient` manually: `createApolloNextClient` keeps one client inside a
single request and isolates the cache between users.

```ts
// src/graphql/apollo/server.ts
import { createApolloNextClient } from '@shopana/storefront-sdk/next/apollo/server';
import { environmentConfig } from '@src/config/environment.config';

export const { getClient, query, PreloadQuery } =
  createApolloNextClient(environmentConfig);
```

`environmentConfig` is structurally compatible with both clients. Pass
`apolloEnvironmentConfig` to `AppProvider` only when Apollo uses another
endpoint or credentials.

## Preload a query in a Server Component

New Apollo operations should use `*.apollo.graphql` or `*.apollo.ts` so they do
not enter the Relay compiler pipeline.

```tsx
import { Suspense } from 'react';
import { PreloadQuery } from '@src/graphql/apollo/server';
import { ProductPageDocument } from '@codegen/apollo/operations';
import { ProductQueryBoundary } from './ProductQueryBoundary';

export default function ProductPage({ handle }: { handle: string }) {
  return (
    <PreloadQuery query={ProductPageDocument} variables={{ handle }}>
      {(queryRef) => (
        <Suspense fallback={null}>
          <ProductQueryBoundary queryRef={queryRef} />
        </Suspense>
      )}
    </PreloadQuery>
  );
}
```

The client boundary can either receive `queryRef` directly and call
`useReadQuery`, or use the SDK context matching the existing Relay provider
pattern:

```tsx
'use client';

import {
  ApolloQueryProvider,
  useApolloPreloadedQuery,
} from '@shopana/storefront-sdk/next/apollo/client';
import type { TransportedQueryRef } from '@shopana/storefront-sdk/next/apollo/client';
import type {
  ProductPageQuery,
  ProductPageQueryVariables,
} from '@codegen/apollo/operations';

export function ProductQueryBoundary({
  queryRef,
}: {
  queryRef: TransportedQueryRef<ProductPageQuery, ProductPageQueryVariables>;
}) {
  return (
    <ApolloQueryProvider queryRef={queryRef}>
      <ProductView />
    </ApolloQueryProvider>
  );
}

function ProductView() {
  const { data } = useApolloPreloadedQuery<ProductPageQuery>();
  return <div>{data.product.title}</div>;
}
```

## Apollo `useFragment`

Apollo's `useFragment` is a live cache subscription. Unlike Relay's hook, it
does not fetch missing fields and its `from` argument is a normalized cache
object/reference, not a Relay fragment key.

```tsx
'use client';

import { useFragment } from '@shopana/storefront-sdk/next/apollo/client';
import { ProductCardFragmentDoc } from '@codegen/apollo/operations';
import type { ProductCardFragment } from '@codegen/apollo/operations';

export function ProductCard({ product }: { product: ProductCardFragment }) {
  const { data, complete } = useFragment({
    fragment: ProductCardFragmentDoc,
    from: product,
  });

  if (!complete) return null;
  return <article>{data.title}</article>;
}
```

Objects read by fragments must include `__typename` and the fields used by the
cache identity policy (normally `id`). Schema-specific `keyFields` and
connection merge policies belong in the shared `createApolloCache` factory;
the RSC and browser clients must use identical normalization rules. Runtime
overrides are also available through `CreateApolloClientOptions.cacheConfig`.
The SDK exports Apollo's `relayStylePagination` helper from `graphql/apollo`
for cursor connections.

## Generate typed Apollo documents

```bash
yarn codegen:apollo
```

This generates `TypedDocumentNode` values in
`codegen/apollo/operations.ts`. It does not process or modify existing Relay
operations.

For non-React server code such as metadata generation, use `query` from the
registered server module. `createApolloServerQueryLoader` and
`loadSerializableQuery` are also available when a serializable `{ data,
variables, cacheState }` payload is explicitly required.
