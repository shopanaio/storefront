# Theme-owned page data: single-commit cutover plan

## Goal

Move ownership of page GraphQL operations, variables, pagination descriptors,
mapping, metadata, and page providers from `@shopana/storefront` and
`@shopana/storefront-sdk` into the theme.

The runtime must only resolve routes, load a theme page definition, coordinate
data loading and metadata, and render the resulting typed template. This is a
single-commit cutover: no compatibility adapters, fallback definitions,
deprecated exports, or intermediate public APIs are allowed.

## 1. Runtime page contracts

Add `packages/shopana-storefront-runtime/src/next/page-definition.ts` with the
following contracts:

```ts
export interface RuntimePageContext<TPageType extends PageType> {
  pageType: TPageType;
  request: SDKRequestContext;
  routeParams: Record<string, string | undefined>;
  searchParams: Record<string, string | string[] | undefined>;
}

export type RuntimePageDataResult<TData> =
  | { status: 'ready'; data: TData }
  | { status: 'not-found' };

export interface RuntimePageProviderProps<TData> {
  data: TData;
  children: ReactNode;
}

export interface RuntimePageDefinition<TData> {
  loadData(
    context: RuntimePageContext<Exclude<PageType, '404'>>
  ): Promise<RuntimePageDataResult<TData>>;

  loadTemplate(): Promise<PageTemplate<TData>>;

  generateMetadata?(
    context: RuntimePageContext<Exclude<PageType, '404'>>,
    data: TData
  ): Promise<Metadata> | Metadata;

  Provider?: ComponentType<RuntimePageProviderProps<TData>>;
}
```

Use a separate contract for the not-found renderer:

```ts
export interface RuntimeNotFoundContext {
  pageType: '404';
  request: SDKRequestContext;
}

export interface RuntimeNotFoundDefinition<TData> {
  loadData(context: RuntimeNotFoundContext): Promise<TData>;
  loadTemplate(): Promise<PageTemplate<TData>>;
  Provider?: ComponentType<RuntimePageProviderProps<TData>>;
}
```

The 404 definition cannot return `not-found`, because the not-found renderer
must never recursively call `notFound()`.

Provide `defineRuntimePage<TData>()` and `defineRuntimePages()` helpers so each
theme definition retains the relationship between its data, provider, metadata,
and `PageTemplate<TData>`.

## 2. Exact lazy registry format

Use module namespace loaders with a required default export:

```ts
export interface RuntimePageModule<TData = unknown> {
  default: RuntimePageDefinition<TData>;
}

export interface RuntimeNotFoundModule<TData = unknown> {
  default: RuntimeNotFoundDefinition<TData>;
}

export type RuntimePageRegistry = {
  [TPageType in Exclude<PageType, '404'>]: () => Promise<
    RuntimePageModule<unknown>
  >;
} & {
  '404': () => Promise<RuntimeNotFoundModule<unknown>>;
};
```

The Bite & Crunch registry must be complete:

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

Use one consistent theme structure:

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

## 3. Error semantics

Runtime behavior must distinguish programming errors, server failures, and
missing storefront entities:

| Situation | Behavior |
| --- | --- |
| Registry key is missing | Throw `RuntimeInvariantError` |
| Loaded module has no default definition | Throw `RuntimeInvariantError` |
| Dynamic import or GraphQL fails | Propagate the server error |
| `loadData()` returns `not-found` | Call Next `notFound()` |
| 404 definition fails | Propagate to the global error boundary |

`loadTemplate()` does not return `null`. A missing template is a programming
error rather than a user-facing 404.

## 4. Request-scoped data sharing with metadata

Inside `createRuntimePage()`, create a single execution loader using React
`cache()`:

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
    };
    const result = await definition.loadData(context);
    return { definition, context, result };
  }
);
```

Requirements:

- Canonically sort route and search parameter keys before serialization.
- Page and `generateMetadata` must produce identical cache arguments.
- Execute `loadData()` once per request.
- Cache and propagate GraphQL failures consistently.
- Pass loaded data to `generateMetadata(context, data)`.
- Load the template only while rendering Page, not while generating metadata.
- If the shared result is `not-found`, Page and metadata both call
  `notFound()`.

## 5. Remove page data ownership from runtime

Remove from `packages/shopana-storefront-runtime/src/next/page.tsx`:

- `SdkHomePageQuery`, `SdkProductQuery`, `SdkCollectionQuery`, and
  `SdkSearchQuery` imports and types;
- home, product, collection, and search server loaders;
- home, product, collection, and search SDK data providers;
- `LoadedPageData`;
- `loadPageData()`;
- `PageWrapper`;
- Apollo `environmentConfig` from `CreateRuntimePageOptions`;
- the generated template switch.

The resulting flow is:

```text
resolve route
  -> load definition
  -> load request-scoped data
  -> load typed template
  -> wrap with optional Provider
  -> render Builder
```

Rendering must follow this shape:

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

## 6. Apollo page-cache hydration

`loadSerializableQuery()` returns a normalized `cacheState`. Do not discard it
while mapping page data.

Add an infrastructure-only client component to the SDK:

```tsx
<ApolloCacheHydrator state={cacheState}>
  {children}
</ApolloCacheHydrator>
```

`ApolloCacheHydrator` must:

1. Obtain the current client through `useApolloClient()`.
2. Before rendering child hooks, merge
   `client.cache.extract()` with the incoming state through
   `mergeApolloCacheStates()`.
3. Restore the merged cache synchronously.
4. Restore a given state object only once during normal rerenders.
5. Restore a new state after client navigation.
6. Avoid overwriting later client-side cache changes with a stale page state.

Theme page data explicitly carries its hydration payload and required fragment
references:

```ts
interface BiteCrunchProductPageData {
  apolloState: NormalizedCacheObject;
  product: ProductViewModel;
  productReviewsRef: BiteCrunchProductReviewsFragment | null;
}
```

The theme-owned provider applies hydration:

```tsx
function ProductPageProvider({ data, children }) {
  return (
    <ApolloCacheHydrator state={data.apolloState}>
      {children}
    </ApolloCacheHydrator>
  );
}
```

This is required for `useFragment`, product reviews, pagination, `fetchMore`,
and normalized entity reuse. Root `AppProvider.apolloInitialState` remains
responsible only for cart/session state loaded before nested page execution.

## 7. Move root GraphQL operations into the theme

Create theme-owned operations:

```text
src/runtime/pages/home/HomePageQuery.graphql
src/runtime/pages/product/ProductPageQuery.graphql
src/runtime/pages/collection/CollectionPageQuery.graphql
src/runtime/pages/search/SearchPageQuery.graphql
```

Use theme-owned operation names:

- `BiteCrunchHomePageQuery`
- `BiteCrunchProductPageQuery`
- `BiteCrunchCollectionPageQuery`
- `BiteCrunchSearchPageQuery`

Each definition must:

1. Obtain the request-scoped Apollo client.
2. Execute its theme query and variables.
3. Return `not-found` when the requested product or collection is absent.
4. Map API data to its theme view model.
5. Preserve the normalized cache state.
6. Preserve typed fragment references required by client consumers.

Example:

```ts
const preloaded = await loadSerializableQuery(...);

if (!preloaded.data.product) {
  return { status: 'not-found' };
}

return {
  status: 'ready',
  data: {
    apolloState: preloaded.cacheState,
    product: mapProduct(preloaded.data.product),
    productReviewsRef: preloaded.data.product,
  },
};
```

Definitions for pages that need no query explicitly return ready data such as
`null` or a small theme-owned value. The absence of a query is still a theme
decision.

## 8. Move pagination ownership into the theme

Delete SDK-owned `graphql/apollo/pagination/descriptors.ts` and move these
descriptors into Bite & Crunch:

- `CategoryPagination`;
- `CollectionPagination`;
- `ProductReviewsPagination`;
- `SearchPagination`.

Use this structure:

```text
src/graphql/pagination/
├── category.ts
├── collection.ts
├── product-reviews.ts
└── search.ts
```

Every descriptor references a theme-generated query document:

```ts
export const CollectionPagination = definePaginationQuery({
  query: BiteCrunchCollectionPageQueryDocument,
  getConnection: (data) => data.category?.listing,
  getNextVariables: ({ variables, count, endCursor }) => ({
    ...variables,
    first: count,
    after: endCursor,
  }),
});
```

Migrate all current consumers, including:

- collection page and listing blocks;
- box-builder category activity;
- product reviews;
- search listing and search pagination hooks;
- associated refetch and fetch-more hooks.

Keep only generic pagination infrastructure in the SDK:

- `definePaginationQuery`;
- `usePaginationQuery`;
- pagination types;
- shared Apollo cache policies.

## 9. Move page contexts and mapping into the theme

Remove SDK page-specific providers, contexts, and hooks:

- `HomeDataProvider` and `useHomeData`;
- `ProductDataProvider` and `useProductData`;
- `CollectionDataProvider` and `useCollectionData`;
- `SearchDataProvider` and `useSearchData`.

Theme components consume typed Builder data:

```ts
const { data } = useTemplateData<BiteCrunchProductPageData>();
```

Move the API-to-view-model mapping currently located in SDK providers into the
corresponding theme page directory.

Explicitly migrate:

- `raw.product` to `productReviewsRef`;
- `raw.category.handle` to the theme collection model;
- `usePreloadedProduct`;
- `mapApiProductToProduct`;
- collection and search product mappers;
- hooks importing SDK root page-query types.

## 10. Clean SDK GraphQL ownership

Remove from the SDK after all consumers are migrated:

- home/product/collection/search root query `.graphql` files;
- root query TypeScript wrappers;
- page server loaders;
- page-specific providers, contexts, and hooks;
- page-only fragments that have no remaining SDK consumers;
- pagination descriptor exports;
- README and architecture references to SDK-owned page queries.

Do not remove cart, session, mutation, or genuinely shared fragment operations.
Use `rg` to inventory all of the following before deletion:

- `Sdk*QueryDocument` outside generated files;
- pagination descriptors;
- `useHomeData`, `useProductData`, `useCollectionData`, and `useSearchData`;
- fragment types and wrapper files;
- package exports;
- `usePreloadedProduct` and `mapApiProductToProduct`;
- README and architecture documents.

## 11. Separate SDK and theme code generation

Theme codegen continues reading theme `src/**/*.graphql`.

Add a separate SDK output target to the existing workspace codegen so the SDK
generated file is derived only from remaining SDK documents:

```ts
'../shopana-storefront-sdk/src/graphql/apollo/generated/operations.ts': {
  schema: 'schema.shopana.graphql',
  documents: ['../shopana-storefront-sdk/src/**/*.graphql'],
  plugins: [
    'typescript',
    'typescript-operations',
    'typed-document-node',
  ],
}
```

Requirements:

- Theme output contains only theme operations.
- SDK output contains only SDK operations.
- Deleted page operations disappear from SDK output through codegen.
- Generated files are never manually edited.

## 12. Define the complete 404 flow

Generated `not-found.tsx` receives the same theme registry:

```ts
createRuntimeNotFound({ pages: runtimePages });
```

`createRuntimeNotFound()` must:

1. Read `SDKRequestContext` through `getRequestContext()`.
2. Require `pages['404']`.
3. Load and validate `module.default`.
4. Build `RuntimeNotFoundContext`.
5. Run its `loadData()`.
6. Load `PageTemplate<TData>`.
7. Wrap Builder with the optional Provider.
8. Never call `notFound()` again.
9. Propagate definition, data, or template failures.

Remove the runtime-owned fallback 404 UI. The theme is fully responsible for
its not-found definition.

## 13. Generated runtime adapters

Generated page adapter:

```ts
import { runtimePages } from '@src/runtime/pages';

createRuntimePage({
  pages: runtimePages,
  modulesContext: require.context(...),
});
```

Generated not-found adapter:

```ts
import { runtimePages } from '@src/runtime/pages';

createRuntimeNotFound({ pages: runtimePages });
```

The adapters must contain no `environmentConfig`, template switch, SDK page
query imports, or compatibility fallbacks.

## 14. Verification and definition of done

Static acceptance criteria:

- Runtime imports no Apollo page queries, loaders, or page providers.
- SDK exports no concrete page pagination descriptors.
- Theme imports none of `SdkHomePageQuery`, `SdkProductQuery`,
  `SdkCollectionQuery`, or `SdkSearchQuery`.
- SDK page-specific data providers, contexts, and hooks are gone.
- SDK page-specific server loaders are gone.
- Registry contains every `PageType` and every lazy module has a default
  definition.
- Metadata and Page share one request-scoped `loadData()` result.
- Generated files contain no stale SDK root page operations.

Runtime acceptance matrix:

- home SSR;
- product SSR and missing-product 404;
- collection SSR and missing-collection 404;
- search with query parameters;
- product reviews without an initial client refetch;
- collection pagination continuing from the initial connection;
- search pagination;
- box-builder category pagination;
- metadata built from the shared page data;
- module pages;
- theme-owned 404 rendering;
- GraphQL/import failures returning server errors rather than 404;
- favicon and dotted storefront routes remaining correct.

Allowed verification commands under project instructions:

- the normal codegen command;
- `runtime:init`;
- ESLint for changed files;
- `git diff --check`;
- HTTP checks against the development server.

Do not run build, test, or tsc for verification.

## Commit

Commit only after the complete cutover is working:

```text
refactor: move page data and GraphQL ownership to theme
```

The commit must contain the complete runtime, SDK, codegen, theme, pagination,
hydration, metadata, 404, consumer, export, and documentation migration. No
backward-compatible code may remain.
