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

## Section settings

`SectionConfig<TSettings>` accepts a strictly typed editor `schema`. A control
ID must be a key of `TSettings`, and its value type must match the control. For
example, `checkbox` can target only a boolean setting and `range` only a number.

Entity pickers use `type: 'entity_picker'`, declare a supported entity type, and
persist only the selected entity's stable `handle` or `id`. Hydrated API
entities never become part of a template. Category, product, article, blog, and
page pickers use handles by default. Navigation menus and navigation items can
store either handles or Relay IDs through `valueField`; a navigation-item picker
can also be limited to a menu with `navigationMenuId`.

```ts
interface Settings {
  categoryHandle: string;
  showPagination: boolean;
}

const section = {
  component: ProductSection,
  settings: {
    categoryHandle: 'electronics',
    showPagination: true,
  },
  schema: {
    name: 'Products',
    settings: [
      {
        type: 'entity_picker',
        entity: 'category',
        id: 'categoryHandle',
        label: 'Category',
      },
      {
        type: 'checkbox',
        id: 'showPagination',
        label: 'Show pagination',
      },
    ],
  },
} satisfies SectionConfig<Settings>;
```

A navigation-item relation may store its menu-local handle and be scoped to one
menu:

```ts
{
  type: 'entity_picker',
  entity: 'navigation_menu_item',
  valueField: 'handle',
  navigationMenuId: 'gid://shopana/OnlineStoreNavigationMenu/main-menu',
  id: 'navigationItemHandle',
  label: 'Navigation item',
}
```

Blocks use the same control union and type guarantees:

```ts
interface ButtonBlockSettings {
  label: string;
  style: 'primary' | 'secondary';
}

const buttonBlock = {
  component: ButtonBlock,
  settings: { label: 'Shop now', style: 'primary' },
  schema: {
    name: 'Button',
    settings: [
      { type: 'text', id: 'label', label: 'Label' },
      {
        type: 'select',
        id: 'style',
        label: 'Style',
        options: [
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
        ],
      },
    ],
  },
} satisfies BlockConfig<ButtonBlockSettings>;
```

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
- `Product.questions`, keyed by `sort`;
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

## Account cart after a sign-in

After each sign-in the account cart replaces or absorbs the guest cart of the
browser, then `CART_CLAIMED_EVENT` is dispatched on `window` with the account
checkout and the merged guest checkout, if any. Modules use the public entry
`@shopana/storefront-sdk/modules/cart/react`:

```tsx
import { useCartClaimed } from '@shopana/storefront-sdk/modules/cart/react';

useCartClaimed(({ checkoutId, mergedFromCheckoutId }) => setClaimed(true));
```

`useClaimAccountCart()` from the same entry claims the cart on request, e.g.
after placement answered `CHECKOUT_CLAIM_REQUIRED`.

## Closed module pages

A page module declares `access: { session: 'required' }` in `registerModule()`
to close its pages to visitors without a session; `publicPaths` keeps some of
them open (path-to-regexp patterns over the same locale-free pathname as
`path`):

```ts
registerModule({
  type: 'page',
  slug: 'account',
  path: '/account{/*path}',
  access: { session: 'required', publicPaths: ['/account/reset-password'] },
  loader: async () => import('./page/page'),
});
```

Such a visitor goes to the home page of the same locale
(`buildClosedPageRedirect()`), with the `?auth=` result of a sign-in that did
not complete carried over:

- the runtime answers the request with a redirect before the module loads; a
  request whose access token expired while the browser still has a session is
  admitted, since the browser refreshes it;
- `ClosedPageGuard`, which the runtime wraps around an admitted page, leaves
  once with `location.replace` when the browser finds the session missing (a
  rejected refresh, a session ended in another tab). A sign-out on the page is
  not followed: `useSignOut()` leaves for its own address.

The home page is never closed: `registerModule()` refuses a closed module that
matches `/`, and the runtime refuses a redirect to a closed page, so a redirect
cannot lead back to a closed page.

## Account product actions

`useAccountProductActions({ productId, variantId })` from
`@shopana/storefront-sdk/modules/account/react` reads and changes the wishlist
and comparisons of the signed-in customer for one product page. Both are
customer-owned: without a session nothing is queried, `requiresSignIn` is true
and the setters do nothing, so the theme asks for a sign-in first.

`setWishlisted(productId, wishlisted)` and `setCompared(variantId, compared)`
take the wanted state instead of toggling it. An action asked for before a
sign-in (`useAuthAction` of `@shopana/storefront-auth/react`) can therefore run
after it without undoing what the account already has: adding a saved product
or a compared variant again leaves it as it is.

## Code generation

SDK GraphQL documents live only under `packages/shopana-storefront-sdk/src`.
The workspace `codegen` command acquires one root `schema.shopana.graphql`
artifact, then generates SDK and active-theme operations independently from
that same artifact. Generated files are never edited manually.

## Current Storefront schema API

`createStorefrontApi(client)` is available from the package root and
`@shopana/storefront-sdk/modules/storefront`. It uses the caller's Apollo client,
authentication and normalized cache. In React, use `useStorefrontApi()` from
`@shopana/storefront-sdk/modules/storefront/react`.

```ts
const api = createStorefrontApi(client);
const collection = await api.loadCollectionByHandle({ handle: 'summer' });
const products = await api.loadCollectionProducts({
  id: collection!.id,
  first: 20,
  sort: 'NEWEST',
});
const options = await api.loadProductOptions({ id: productId });
const image = await api.loadImage({
  id: mediaId,
  transform: {
    fit: 'CONTAIN',
    gravity: 'CENTER',
    quality: 80,
    preferredContentType: 'AVIF',
  },
});
```

Collection products support cursors, search, filters and sorting. Subsequent
pages are fetched from the server and merged into the collection's cached
connection; search/filter/sort combinations have separate cache entries.
Collection media supports both pagination directions and nullable media nodes.
`loadProductOptions` maps options to the domain model, including nullable
`ProductOption.type` and swatches. The API also exposes page descriptions and
excerpts, review-media revisions, and comparison cells with their original
feature or selected-option objects.

The cart model and shared cart fragment include `status`, `expiresAt`, `valid`,
`resultRevision`, `loyaltyRedemption` and `loyaltyRewardEntitlementId`. Cart and
loyalty timestamps map to `Date`; loyalty money maps to numeric domain money.
`useCartStatus`, `useCartExpiresAt` and `useCartLoyaltyRedemption` are available
from the cart selectors module.

`updateLoyaltyRedemption` and `removeLoyaltyRedemption` accept the schema inputs,
including points and reward-entitlement selection. Their React counterpart,
`useLoyaltyRedemption` from the cart hooks module, obtains the active cart ID and
updates the cart context after successful mutations. Business errors throw
`StorefrontMutationError` with the original `userErrors`.

`placeOrder` requires a caller-generated idempotency key. Preserve this key when
retrying the same attempt. `loadCheckoutPlacement` refreshes placement status
from the server, including `placementState` and the full customer action.
`handlePlaceOrderCustomerAction(action, handlers)` dispatches `CLIENT_SDK`,
`REDIRECT` or `INSTRUCTIONS` to app-supplied handlers. The app owns payment SDK
integration, navigation and instructions presentation.

Internal localization `source*` fields are inaccessible and are not selected by
SDK operations. Theme integration is a separate step; these APIs do not change
a theme's queries or UI.
