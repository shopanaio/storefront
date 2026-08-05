# Theme-owned page data: single-commit cutover plan

## Goal and ownership boundary

Move ownership of page GraphQL documents, variables, pagination descriptors,
API-to-view-model mapping, metadata, page data types, and page providers from
`@shopana/storefront` and `@shopana/storefront-sdk` into the active theme.

The boundaries after the cutover are:

- the theme owns what a page queries and how the result is interpreted;
- the SDK owns generic Apollo infrastructure, including client creation, cache
  extraction, hydration primitives, and generic pagination helpers;
- the runtime resolves routes, creates request-scoped services, loads a theme
  definition, coordinates data and metadata, and renders the template;
- the theme never creates, configures, or receives a raw server
  `ApolloClient`;
- module pages keep their existing independent registry and execution path.

This is a single-commit cutover. Do not add compatibility adapters, fallback
definitions, deprecated exports, or intermediate public APIs. Backward
compatibility is not a goal.

## 1. Generic runtime query service

The runtime receives `environmentConfig` and creates a request-scoped query
service over the SDK-owned Apollo client:

```ts
export interface RuntimePageServices {
  loadQuery<TData, TVariables extends OperationVariables>(
    document: TypedDocumentNode<TData, TVariables>,
    variables: TVariables
  ): Promise<SerializableApolloQuery<TData, TVariables>>;
}
```

Inside `createRuntimePage()`, the service is implemented with
`getApolloRequestClient(environmentConfig)` and `loadSerializableQuery()`.
The same service contract is available to the 404 definition if it needs data.

The service, not the theme:

1. obtains the request-scoped Apollo client;
2. applies request cookies and Apollo environment configuration;
3. executes the typed document;
4. returns `data`, `variables`, and normalized `cacheState`.

The theme supplies the document and variables and maps the returned data. A
raw server Apollo client and `environmentConfig` must not appear in theme page
definitions.

## 2. Runtime page contracts

Add `packages/shopana-storefront-runtime/src/next/page-definition.ts`.

```ts
export type RuntimeRenderablePageType = Exclude<PageType, '404'>;

export interface RuntimePageContext<
  TPageType extends RuntimeRenderablePageType,
> {
  pageType: TPageType;
  request: SDKRequestContext;
  routeParams: Readonly<Record<string, string | undefined>>;
  searchParams: Readonly<
    Record<string, string | string[] | undefined>
  >;
  services: RuntimePageServices;
}

export type RuntimePageDataResult<TData> =
  | { status: 'ready'; data: TData }
  | { status: 'not-found' };

export interface RuntimePageProviderProps<TData> {
  data: TData;
  children: ReactNode;
}

export interface RuntimePageDefinition<
  TPageType extends RuntimeRenderablePageType,
  TData,
> {
  readonly pageType: TPageType;

  loadData(
    context: RuntimePageContext<TPageType>
  ): Promise<RuntimePageDataResult<TData>>;

  loadTemplate(): Promise<PageTemplate<TData>>;

  generateMetadata?(
    context: RuntimePageContext<TPageType>,
    data: TData
  ): Promise<Metadata> | Metadata;

  Provider?: ComponentType<RuntimePageProviderProps<TData>>;
}
```

Use a separate non-recursive 404 contract:

```ts
export interface RuntimeNotFoundContext {
  pageType: '404';
  request: SDKRequestContext;
  services: RuntimePageServices;
}

export interface RuntimeNotFoundDefinition<TData> {
  readonly pageType: '404';
  loadData(context: RuntimeNotFoundContext): Promise<TData>;
  loadTemplate(): Promise<PageTemplate<TData>>;
  Provider?: ComponentType<RuntimePageProviderProps<TData>>;
}
```

The 404 definition cannot return `not-found`, because its renderer must never
recursively call Next `notFound()`.

Provide `defineRuntimePage()`, `defineRuntimeNotFound()`, and
`defineRuntimePages()` helpers. They must preserve the relationship between:

- the registry key and `definition.pageType`;
- `TData`, `loadData`, metadata, Provider, and `PageTemplate<TData>`;
- each lazy module and its required default export.

Do not expose a public `RuntimePageDefinition<unknown>` registry constraint:
`TData` occurs in both input and output positions and cannot safely be erased
to `unknown`. Let `defineRuntimePages()` infer the concrete module map and
perform any necessary type erasure privately inside the runtime.

## 3. Lazy theme registry

Every lazy module has a required default definition:

```ts
export default defineRuntimePage({
  pageType: 'product',
  // loadData, loadTemplate, generateMetadata, Provider
});
```

The complete theme registry is:

```ts
export const runtimePages = defineRuntimePages({
  home: () => import('./home'),
  product: () => import('./product'),
  collection: () => import('./collection'),
  search: () => import('./search'),
  blog: () => import('./blog'),
  article: () => import('./article'),
  page: () => import('./page'),
  cart: () => import('./cart'),
  'list-collections': () => import('./list-collections'),
  '404': () => import('./not-found'),
});
```

`defineRuntimePages()` must reject missing or extra reserved page keys and a
definition whose `pageType` does not equal its registry key.

Use one theme structure:

```text
src/runtime/pages/
├── index.ts
├── home/index.tsx
├── product/index.tsx
├── collection/index.tsx
├── search/index.tsx
├── blog/index.tsx
├── article/index.tsx
├── page/index.tsx
├── cart/index.tsx
├── list-collections/index.tsx
└── not-found/index.tsx
```

## 4. Error and metadata semantics

| Situation | Behavior |
| --- | --- |
| Registry key is missing | Throw `RuntimeInvariantError` |
| Module has no valid default definition | Throw `RuntimeInvariantError` |
| Definition page type differs from registry key | Throw `RuntimeInvariantError` |
| Dynamic import, query, mapping, metadata, or template load fails | Propagate the error |
| Renderable `loadData()` returns `not-found` | Call Next `notFound()` |
| Route resolves directly to `404` | Call Next `notFound()` without loading a renderable definition |
| Optional `generateMetadata` is absent | Return an empty metadata object |
| 404 definition fails | Propagate to the global error boundary |

`loadTemplate()` never returns `null`. A missing template is a programming
error, not a user-facing missing entity.

Both Page and `generateMetadata` call `notFound()` for the same missing entity.
The generated Next not-found renderer then loads the theme's 404 definition.
The 404 definition does not generate metadata during this cutover.

Module pages retain their existing module-specific metadata behavior and do
not use the reserved page registry.

## 5. Shared page execution for Page and metadata

Create one cached execution function inside `createRuntimePage()`:

```ts
const loadPageExecution = cache(
  async (
    pageType: RuntimeRenderablePageType,
    routeParamsKey: string,
    searchParamsKey: string
  ) => {
    const request = await getRequestContext();
    const definition = await loadDefinition(pageType);
    const context = {
      pageType,
      request,
      routeParams: parseStableRecord(routeParamsKey),
      searchParams: parseStableRecord(searchParamsKey),
      services,
    };
    const result = await definition.loadData(context);
    return { definition, context, result };
  }
);
```

Requirements:

- serialize plain records with canonically sorted keys;
- preserve string-array values and their order;
- normalize absent `searchParams` to the same empty record in Page and
  metadata;
- use identical arguments after identical route resolution;
- execute `loadData()` once per request for Page and metadata together;
- cache and propagate rejected query executions consistently;
- pass the ready data to theme metadata;
- load the template only from Page, never from metadata;
- do not use this execution function for module routes or direct 404 routes.

## 6. Preserve the independent module-page branch

The current module registry remains separate from `runtimePages`.
`createRuntimePage()` continues to:

1. initialize `modulesContext` registrations;
2. resolve module routes before reserved storefront routes;
3. invoke the module loader;
4. preserve `DynamicModulePageProps`, `segments`, `pathParams`, locale, and
   search parameters;
5. build module metadata without loading a reserved page definition;
6. propagate module import and render failures.

The reserved theme registry does not contain a synthetic `module` page type.

## 7. Runtime rendering

Remove from `packages/shopana-storefront-runtime/src/next/page.tsx`:

- concrete SDK page query imports and types;
- home/product/collection/search server loaders;
- SDK page-specific providers;
- `LoadedPageData`, `loadPageData()`, and `PageWrapper`;
- the generated template switch and nullable template fallback.

The reserved page flow becomes:

```text
resolve reserved route
  -> load typed theme definition
  -> execute request-scoped data loader
  -> load typed template
  -> wrap with optional theme Provider
  -> render Builder
```

```tsx
const content = (
  <Builder template={template} data={data} pageType={pageType} />
);

return Provider ? (
  <Provider data={data}>{content}</Provider>
) : (
  content
);
```

## 8. Theme-owned GraphQL documents

Create page operations:

```text
src/runtime/pages/home/HomePageQuery.graphql
src/runtime/pages/product/ProductPageQuery.graphql
src/runtime/pages/collection/CollectionPageQuery.graphql
src/runtime/pages/search/SearchPageQuery.graphql
```

Use these names:

- `HomePageQuery`;
- `ProductPageQuery`;
- `CollectionPageQuery`;
- `SearchPageQuery`.

Create independent minimal client-pagination operations:

```text
src/graphql/pagination/CategoryPaginationQuery.graphql
src/graphql/pagination/CollectionPaginationQuery.graphql
src/graphql/pagination/ProductReviewsPaginationQuery.graphql
src/graphql/pagination/SearchPaginationQuery.graphql
```

Use these names:

- `CategoryPaginationQuery`;
- `CollectionPaginationQuery`;
- `ProductReviewsPaginationQuery`;
- `SearchPaginationQuery`.

Do not use a full page query as a `fetchMore` document. Loading another page of
one connection must not refetch unrelated page data or other connections.

Move into the theme every fragment transitively referenced by page and
pagination operations. Initial page queries and pagination queries must spread
the same theme-owned connection and node fragments. That lets an initial SSR
page query satisfy the corresponding client pagination query from Apollo's
normalized cache even though the operations have different names.

A theme operation must not spread an SDK-only fragment because the theme and
SDK codegen document sets are separate. Keep a fragment in the SDK only when a
remaining SDK-owned operation genuinely consumes it.

Each queried page definition:

1. calls `context.services.loadQuery()` with its theme document and variables;
2. returns `not-found` when a requested product or collection is absent;
3. maps API data to a theme-owned view model;
4. carries one normalized hydration state containing every initial connection;
5. carries typed fragment references required by client consumers.

```ts
const preloaded = await context.services.loadQuery(
  ProductPageQueryDocument,
  {
    handle: context.routeParams.handle!,
    reviewsFirst: PRODUCT_REVIEWS_PAGE_SIZE,
    reviewsAfter: null,
    reviewsSort: PRODUCT_REVIEWS_DEFAULT_SORT,
  }
);

if (!preloaded.data.product) {
  return { status: 'not-found' };
}

return {
  status: 'ready',
  data: {
    hydration: {
      key: createPageHydrationKey(context),
      state: preloaded.cacheState,
    },
    product: mapProduct(preloaded.data.product),
    productReviewsRef: preloaded.data.product,
  },
};
```

When a page has several fixed connections, prefer one page operation that
loads the initial slice of every connection actually rendered by that page. If
they cannot reasonably be loaded by one operation, execute the real theme
queries in parallel and merge their returned cache states once before creating
the single page hydration payload. Never expose or create an additional Apollo
client in the theme.

Pages that need no query explicitly return ready theme-owned data such as
`null`. The absence of a query remains a theme decision.

## 9. Apollo page-cache hydration

The SDK provides an infrastructure-only client component:

```tsx
<ApolloCacheHydrator
  hydrationKey={data.hydration.key}
  state={data.hydration.state}
>
  {children}
</ApolloCacheHydrator>
```

The raw server Apollo client is never serialized. Only one merged normalized
state is transported per page, regardless of how many paginated connections it
contains.

The hydrator contract must guarantee:

1. child hooks never observe the cache before the page snapshot is applied;
2. all initial connections are restored before their hooks render;
3. one `hydrationKey` is applied at most once to a browser Apollo client;
4. ordinary rerenders cannot reapply an old snapshot;
5. a different navigation key applies its new snapshot;
6. replay of an older key cannot overwrite cache changes made after a newer
   navigation;
7. current browser cache records are retained when absent from the incoming
   snapshot;
8. cache merge precedence is documented before relying on
   `mergeApolloCacheStates()`.

Do not define correctness only as `restore(merge(current, incoming))`: the
current merge helper gives later arguments field precedence and by itself does
not prevent a stale snapshot from overwriting newer browser fields. Track
applied/navigation keys explicitly and reject stale replays before restoring.

Theme providers apply hydration once around every connection consumer:

```tsx
function ProductPageProvider({ data, children }) {
  return (
    <ApolloCacheHydrator
      hydrationKey={data.hydration.key}
      state={data.hydration.state}
    >
      {children}
    </ApolloCacheHydrator>
  );
}
```

Do not add one hydrator per pagination. One page Provider hydrates the shared
browser Apollo cache; the individual hooks remain isolated by their operations,
variables, normalized parents, and field policies.

This is required for `useFragment`, pagination, `fetchMore`, and normalized
entity reuse. Root `AppProvider.apolloInitialState` remains responsible for
cart/session state loaded before nested page execution.

## 10. Theme-owned Apollo pagination

Delete SDK-owned `graphql/apollo/pagination/descriptors.ts` and add:

```text
src/graphql/pagination/
├── category.ts
├── collection.ts
├── product-reviews.ts
├── search.ts
├── CategoryPaginationQuery.graphql
├── CollectionPaginationQuery.graphql
├── ProductReviewsPaginationQuery.graphql
└── SearchPaginationQuery.graphql
```

Mappings:

| Descriptor | Theme operation |
| --- | --- |
| `CategoryPagination` | `CategoryPaginationQueryDocument` |
| `CollectionPagination` | `CollectionPaginationQueryDocument` |
| `ProductReviewsPagination` | `ProductReviewsPaginationQueryDocument` |
| `SearchPagination` | `SearchPaginationQueryDocument` |

### One lifecycle per connection

One connection has exactly one descriptor, one variables shape, one cache
identity, and one hook lifecycle. If several real connections are rendered on
the same page, each one uses its own independent hook:

```ts
const products = usePaginationQuery(CollectionPagination, {
  handle,
  first: PRODUCTS_PAGE_SIZE,
  after: null,
  sort: productSort,
  filters: productFilters,
});

const reviews = usePaginationQuery(ProductReviewsPagination, {
  handle,
  first: REVIEWS_PAGE_SIZE,
  after: null,
  sort: reviewSort,
});
```

Apollo does not need a shared page cursor or Hydrogen-style URL namespace. The
equivalent isolation comes from:

- the descriptor and typed operation;
- the parent normalized entity or root field;
- semantic variables included by the field policy's `keyArgs`;
- a separate hook instance and in-flight request guard.

Loading one connection must not refetch another connection, rerun the server
page definition, or replace another connection's loading or error state.

### Continue from the SSR cache

The page operation loads the first slice of every connection required at first
render. The page Provider restores one normalized snapshot before any
pagination hook renders. Every hook starts with exactly the same semantic
variables used by SSR and uses `cache-first`, so it reads its initial slice
without a client request.

Operation names may differ, but the page and pagination operations must select
the same connection field, arguments, connection fragment, and node fragments.
Apollo cache identity, not the operation name, connects SSR data with the
client pagination query.

Canonical initial variables are mandatory. Server and client use the same
representation of `after: null`, default sort, normalized filters, locale, and
handle. Do not use `undefined` in one place and `null` in the other.

### Cache policies and `fetchMore`

Connection policies exclude cursor/window arguments such as `first`, `last`,
`after`, and `before` from cache identity and include variables that define a
different logical list:

The schema-specific registrations belong to the theme; the SDK exposes only
the generic `cursorConnectionPolicy()` factory.

```ts
Category: {
  fields: {
    listing: cursorConnectionPolicy(['sort', 'filters']),
  },
},
Product: {
  fields: {
    reviews: cursorConnectionPolicy(['sort', 'filters']),
  },
},
Query: {
  fields: {
    searchProducts: cursorConnectionPolicy(['query', 'sort', 'filters']),
  },
},
```

Use the actual schema field names. Parent entity identity separates connections
belonging to different products or categories. Root connections include every
parent-identifying argument in `keyArgs`.

`fetchMore` changes only the cursor window for its descriptor. The connection
policy appends edges, deduplicates normalized nodes, and replaces `pageInfo`
with the latest response. A sort/filter refetch resets `after` to `null`;
semantic `keyArgs` prevent it from appending into a different logical list.

### Optional URL synchronization

Apollo owns the execution state of embedded paginations, so cursors do not need
to be in the URL. Filters and sort may be mirrored into search params when they
must be shareable or restorable. Changing one list's URL-visible state resets
only that descriptor and must not reset the other connections.

SEO-visible primary listings may additionally expose canonical navigation
links. That concern stays separate from internal Apollo `fetchMore` and must not
turn several independent connections into one page-level cursor.

Migrate every consumer, including collection sections and blocks, box-builder
category activity, product reviews, search listing, and all associated
refetch/fetch-more hooks.

Keep only generic SDK pagination infrastructure:

- `definePaginationQuery`;
- `usePaginationQuery`;
- generic pagination types;
- the generic `cursorConnectionPolicy` factory.

### Final SDK pagination boundary

After the cutover, the SDK must not import or export any concrete pagination
query, generated page API type, connection accessor, or variables mapper. The
theme supplies all API knowledge through a typed descriptor:

```ts
// Theme-owned code
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

The SDK contract remains fully generic:

```ts
export interface PaginationQueryDescriptor<
  TData,
  TVariables extends OperationVariables,
  TConnection extends CursorConnection,
> {
  query: TypedDocumentNode<TData, TVariables>;
  getConnection(data: TData): TConnection | null | undefined;
  getNextVariables(
    context: PaginationContext<TVariables>
  ): TVariables;
}

export function usePaginationQuery<
  TData,
  TVariables extends OperationVariables,
  TConnection extends CursorConnection,
>(
  descriptor: PaginationQueryDescriptor<
    TData,
    TVariables,
    TConnection
  >,
  variables: TVariables
) {
  // Generic useQuery/fetchMore lifecycle only.
}
```

The SDK learns `TData`, `TVariables`, and `TConnection` structurally from the
descriptor at the call site. It does not reference their generated names and
does not know which API entity or field is being paginated.

Delete from the SDK:

- imports of `SdkCategoryQueryDocument`, `SdkCollectionQueryDocument`,
  `SdkProductQueryDocument`, and `SdkSearchQueryDocument` from pagination code;
- concrete `CategoryPagination`, `CollectionPagination`,
  `ProductReviewsPagination`, and `SearchPagination` definitions and exports;
- generated page/category query types that remain only because of those
  descriptors;
- pagination-specific wrapper files that re-export concrete SDK operations.

The final dependency direction is strictly one-way:

```text
theme GraphQL document
  -> theme codegen types
  -> theme pagination descriptor
  -> generic SDK usePaginationQuery
  -> Apollo useQuery/fetchMore
```

The SDK must never import the theme descriptor. Theme components import the
generic SDK hook and pass their own descriptor into it.

## 11. Move page models and consumers into the theme

Remove SDK page-specific providers, contexts, and hooks:

- `HomeDataProvider` and `useHomeData`;
- `ProductDataProvider` and `useProductData`;
- `CollectionDataProvider` and `useCollectionData`;
- `SearchDataProvider` and `useSearchData`;
- all secondary hooks that depend on those contexts.

Theme components consume typed Builder data:

```ts
const { data } = useTemplateData<ProductPageData>();
```

Move or replace:

- `raw.product` with `productReviewsRef`;
- `raw.category.handle` with the theme collection model;
- `usePreloadedProduct`;
- `mapApiProductToProduct`;
- collection and search product mappers;
- hooks importing SDK root page-query types;
- client consumers of fragments moved from the SDK document set.

## 12. SDK GraphQL cleanup

After all consumers are migrated, remove from the SDK:

- home/product/collection/search root query documents and wrappers;
- the standalone SDK category pagination query when it has no SDK consumer;
- page server loaders;
- page-specific providers, contexts, and hooks;
- page-only fragments with no remaining SDK-owned operation consumer;
- concrete pagination descriptors and their exports;
- obsolete README and architecture references.

Do not remove cart, session, mutations, or fragments still used by genuine
SDK-owned operations.

Before deletion, inventory outside generated files:

- every `Sdk*QueryDocument`;
- every fragment spread reachable from a moved operation;
- all four pagination descriptors;
- `useHomeData`, `useProductData`, `useCollectionData`, `useSearchData` and
  their dependent hooks;
- `usePreloadedProduct` and `mapApiProductToProduct`;
- package exports and documentation references.

## 13. Separate SDK and theme code generation

Do not make the SDK generated output conceptually owned by a theme package.
Introduce an SDK-owned codegen target and make the workspace codegen command
orchestrate both SDK and theme generation from the same freshly fetched Shopana
schema.

The resulting ownership is:

- SDK config scans only `packages/shopana-storefront-sdk/src/**/*.graphql` and
  writes the SDK generated operations file;
- the active theme config scans only its own `src/**/*.graphql` documents and
  writes its theme generated operations file;
- schema acquisition happens once at workspace orchestration level, or the
  exact same schema artifact is explicitly supplied to both configs;
- generated files are never manually edited;
- deleted page and category operations disappear from SDK output through
  codegen.

If codegen dependencies or scripts must be added to the SDK package, update its
package manifest through the normal package workflow. Do not silently write an
SDK artifact as an incidental side effect of a theme-only codegen command.

## 14. Complete 404 flow

Generated `not-found.tsx` receives the same theme registry and runtime query
configuration:

```ts
createRuntimeNotFound({
  environmentConfig,
  pages: runtimePages,
});
```

`createRuntimeNotFound()`:

1. reads `SDKRequestContext` through `getRequestContext()`;
2. creates the same generic runtime query service;
3. requires `pages['404']`;
4. loads and validates the default definition and its `pageType`;
5. runs `loadData()` once;
6. loads `PageTemplate<TData>`;
7. wraps Builder with the optional Provider;
8. never calls Next `notFound()`;
9. propagates definition, data, query, and template failures.

Remove the runtime-owned fallback 404 UI.

## 15. Generated adapters

Generated page adapter:

```ts
import { runtimePages } from '@src/runtime/pages';
import { environmentConfig } from '@src/config/environment.config';

createRuntimePage({
  environmentConfig,
  pages: runtimePages,
  modulesContext: require.context(...),
});
```

Generated not-found adapter:

```ts
import { runtimePages } from '@src/runtime/pages';
import { environmentConfig } from '@src/config/environment.config';

createRuntimeNotFound({
  environmentConfig,
  pages: runtimePages,
});
```

Adapters contain no template switch, concrete query import, raw Apollo client,
or compatibility fallback.

## 16. Verification and definition of done

Static acceptance criteria:

- runtime imports no concrete page query, page loader, or page provider;
- theme definitions receive no raw Apollo client or Apollo environment config;
- SDK exports no concrete page pagination descriptor;
- theme imports none of `SdkHomePageQuery`, `SdkProductQuery`,
  `SdkCollectionQuery`, `SdkSearchQuery`, or `SdkCategoryQuery`;
- SDK page-specific loaders, providers, contexts, and hooks are gone;
- the registry contains every reserved `PageType` exactly once;
- every lazy module has a valid matching default definition;
- metadata and Page share one request-scoped `loadData()` result;
- theme and SDK generated files contain only their owned operations;
- no moved theme document references an SDK-only fragment;
- every client pagination descriptor uses a minimal theme pagination operation,
  not a full page operation;
- every paginated field has an explicit theme-owned cache registration with
  reviewed `keyArgs`;
- SDK pagination source imports no `Sdk*QueryDocument`, concrete generated page
  API type, or theme pagination descriptor.

Runtime acceptance matrix:

- home SSR;
- product SSR and missing-product 404;
- collection SSR and missing-collection 404;
- search with scalar and repeated query parameters;
- product reviews without an initial client refetch;
- collection pagination continuing from the initial connection;
- search pagination;
- box-builder category pagination through its independent query;
- every real connection rendered together hydrating from one page snapshot;
- loading the next page of one connection without network requests, loading
  state changes, or edge mutations in another connection;
- independent sort/filter refetch resetting only its own connection;
- duplicate `fetchMore` calls not duplicating normalized edges;
- client navigation between two hydrated pages without stale cache replay;
- client cache change followed by an ordinary rerender without rollback;
- metadata built from the same loaded page data;
- a page without custom metadata returning empty metadata;
- module pages and module metadata;
- direct theme-owned 404 rendering;
- query/import/mapping failures returning server errors rather than 404;
- favicon and dotted storefront routes remaining correct.

Allowed verification commands under project instructions:

- the normal workspace codegen command;
- `runtime:init`;
- ESLint for changed files;
- `git diff --check`;
- HTTP and browser checks against the development server.

Do not run build, test, or `tsc` for verification.

## Commit

Commit only after the complete cutover is working:

```text
refactor: move page data and GraphQL ownership to theme
```

The commit contains the complete runtime, SDK, services, codegen, theme,
pagination, hydration, metadata, 404, module-preservation, consumer, export,
and documentation migration. No backward-compatible code remains.
