# Storefront data ownership

The storefront has three boundaries:

```text
theme definition
  -> runtime coordination
  -> generic SDK infrastructure
```

## Theme

The active theme owns every reserved page definition. A definition chooses its
GraphQL document and canonical variables, maps raw API results to page data,
generates metadata, loads its typed template, and optionally supplies a page
Provider. Raw route and search parameter records are interpreted only here.

Theme-owned client pagination uses independent minimal operations and concrete
descriptors. Full page operations are never used as `fetchMore` documents.

## Runtime

`@shopana/storefront` resolves reserved routes and module routes. Reserved
routes load the active theme's lazy definition registry. Page rendering and
metadata share one React-cached `loadData()` execution for identical resolved
route and search records.

The runtime creates request-scoped services over the SDK Apollo client. Themes
receive `loadQuery()` and `extractCacheState()`, never the Apollo client or its
environment configuration. Renderable definitions may return `not-found`; the
separate 404 definition cannot recurse into Next `notFound()`.

Module pages keep their independent registry, props, metadata path, and loader.
They are not represented in the reserved theme registry.

## SDK

`@shopana/storefront-sdk` owns Apollo transport, request/browser client
creation, normalized cache policies, cache hydration, generic pagination, cart,
session, and Builder primitives. Both server and browser clients use
`createApolloCache()`.

The SDK has no concrete page query, page loader, page provider, URL state,
theme data model, or concrete pagination descriptor. Its generated GraphQL
output contains only documents under the SDK source tree.

## RSC data contract

Page data crossing the React Server Component boundary consists only of plain
serializable values: primitives, arrays, plain objects, generated GraphQL
results and fragment references, and normalized Apollo cache records. The
runtime rejects functions, symbols, bigint values, class instances, React
elements, clients, documents, and cycles in development, reporting the first
failing value path.

## Codegen direction

```text
workspace schema acquisition
  -> SDK codegen (SDK documents only)
  -> theme codegen (theme documents only)
  -> checkout codegen
```

The root schema is acquired once and supplied to every target by absolute paths
resolved from each config file. Theme-only codegen consumes the existing root
schema and never writes an SDK artifact.
