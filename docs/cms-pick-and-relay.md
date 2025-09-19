## Architecture with cmsPick, Relay and GraphQL colocation

This document explains how to support multiple data providers (e.g., Shopana/Shopify) while maintaining an understandable, predictable architecture with Relay. The goal is to make it easy for newcomers to understand: where the code is located, how to add a second implementation, and why everything works stably.

### In a nutshell
- **Single entry point**: consumer imports one module. Inside it selects implementation via `cmsPick` and does default export.
- **Two implementations per feature**: for each feature/hook/fragment there are `*.shopana.ts[x]` and `*.shopify.ts[x]`. Mixing providers in one file via `if` is not allowed.
- **GraphQL next to code**: fragments and queries are declared next to hooks/components; generated Relay types are in adjacent `__generated__/`.
- **Relay strictly**: `useFragment` accepts only fragment-ref `Something$key` from Relay, not a "similar" object. Page data is read via `usePreloadedQuery`.
- **Unified domain types**: inside provider files data is mapped to agreed `Api*` interfaces. Common code doesn't depend on specific provider.

### 1. Provider selection via cmsPick
Provider is selected by environment variable `NEXT_PUBLIC_CMS_PROVIDER` (`shopana` | `shopify`). With incorrect value — deliberate fail-fast (explicit early failure).

Export rule: provider files and entry point use default export. Named exports in provider files are not used — this simplifies imports and maintains loose coupling.

```ts
// useFeature.shopana.ts
export default function useFeatureShopana() { /* ... */ }

// useFeature.shopify.ts
export default function useFeatureShopify() { /* ... */ }

// index.ts — single entry point
import cmsPick from "@cms/pick";
import useFeatureShopana from "./useFeature.shopana";
import useFeatureShopify from "./useFeature.shopify";

export default cmsPick({
  shopana: useFeatureShopana,
  shopify: useFeatureShopify,
});
```

### 2. Feature structure
- **`index.ts`** — selects implementation via `cmsPick` and exports it by default.
- **`*.shopana.ts[x]` / `*.shopify.ts[x]`** — encapsulate specific provider details and data mapping.
- **`relay/`** next to consuming code — here are "hook + fragment" and/or "hook + query" files, as well as `__generated__/` folder.

### 3. GraphQL colocation: "hook + fragment" and "hook + query"
Declare fragments directly in the hook file that calls `useFragment`. Similarly, declare queries for specific page/feature in the corresponding hook file.

```ts
// useFeatureFragment.shopana.tsx
const FeatureFragment = graphql`
  fragment useFeatureFragment_product on Product {
    id
    title
  }
`;

export default function useFeatureFragment(ref: useFeatureFragment_product$key) {
  const data = useFragment(FeatureFragment, ref);
  return data;
}
```

- **Common queries** that are reused in different places, keep in `src/relay/queries`.
- Generated Relay types always lie next to each other, in `__generated__/`, and are not edited manually.

### 4. Working with Relay: rules that are easy to forget
- In `useFragment` you can only pass fragment-ref of type `Something$key` received from Relay response. Manual object will lead to invariant errors.
- On client read data via `usePreloadedQuery`; preload itself is performed on server/in provider, from where you get reference.
- Use `@include`/`@skip` directives and fragment arguments to avoid pulling unnecessary fields.
- Be careful about nullability of lists and fields — check `null`/`undefined` explicitly.

### 5. Data mapping to domain types
After reading via Relay map structure to domain interfaces `Api*`.
- Do mapping inside provider files (`*.shopana.ts[x]` / `*.shopify.ts[x]`).
- Return same contract for common code.
- Mapping should be deterministic, without side effects.
- Set default values for optional fields — this will simplify UI.

### 6. Naming and conventions
- Provider files — with provider suffix: `*.shopana.ts[x]`, `*.shopify.ts[x]`.
- Names of GraphQL operations (`fragment`/`query`/`mutation`) for both providers should be the same. This guarantees same file and type names in `__generated__` and stable `*key` imports.

```ts
// Provider A
graphql`
  fragment useFeatureFragment_product on Product { ... }
`

// Provider B — same fragment name
graphql`
  fragment useFeatureFragment_product on Product { ... }
`

// Similarly for query
graphql`
  query FeaturePageQuery { ... }
`
```

### 7. Where queries are located
- **Page/feature specific** — next to hook/component (colocation "hook + query").
- **Common and reusable** — in `src/relay/queries`.
- **Generated types** — in `__generated__/` next to sources. Manual editing is not required and not allowed.

### 8. Environment variables
`NEXT_PUBLIC_CMS_PROVIDER` accepts values `shopana` or `shopify` and determines which implementation will be selected at runtime. With incorrect value — explicit error.

### 9. Common mistakes and how to avoid them
- Mixing provider logic in one file via conditional blocks — move differences to separate implementations.
- Passing "similar" to data object to `useFragment` — use only fragment-ref `Something$key`.
- Direct import of provider file instead of import from `index.ts` — breaks loose coupling and selection point.
- Different names of fragments/queries for providers — leads to conflicts in `__generated__` and unstable imports.
- Named exports from provider files — use only default.
