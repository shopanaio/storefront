# Cart Module Integration Plan for the Root Application

## Table of Contents

1. [Overview](#overview)
2. [Current State](#current-state)
3. [Cart Module Architecture](#cart-module-architecture)
4. [Integration Stages](#integration-stages)
5. [Existing Code Migration](#existing-code-migration)
6. [Testing](#testing)
7. [Potential Issues](#potential-issues)

## Overview

The Cart module is located in `packages/shopana-storefront-sdk/src/modules/cart`. It is a full-featured cart management solution with support for:
- Framework-agnostic core logic
- React adapters: hooks, context, providers
- Next.js-specific SSR loaders
- Relay GraphQL integration
- Zustand state management

**Goal:** fully integrate the SDK Cart module into the root application and replace the existing cart implementation.

## Current State

### Existing Cart Implementation

**Location:** `/src/providers/cart/`

**Files:**
- `cart-context.tsx` - old cart context
- `cart-provider.shopana.tsx` - Shopana provider
- `cart-provider.shopify.tsx` - Shopify provider
- `index.ts` - provider selection through `cmsPick`

**Hooks in use:**
- `/src/hooks/cart/` - existing cart hooks

**Problems with the current implementation:**
- Duplicated logic between providers
- Tight coupling to application Relay fragments
- No single source of truth
- Difficult to test

## Cart Module Architecture

### Module Structure

```text
packages/shopana-storefront-sdk/src/modules/cart/
├── core/                           # Framework-agnostic core
│   ├── config.ts                   # Module configuration
│   ├── types.ts                    # TypeScript types
│   ├── graphql/
│   │   ├── fragments/              # GraphQL fragments
│   │   │   ├── CartFragment.ts
│   │   │   └── CartLineFragment.ts
│   │   ├── queries/                # GraphQL queries
│   │   │   └── loadCartQuery.ts
│   │   └── mutations/              # GraphQL mutations
│   │       ├── addToCartMutation.ts
│   │       ├── removeFromCartMutation.ts
│   │       ├── updateCartLineQuantityMutation.ts
│   │       ├── replaceCartItemMutation.ts
│   │       ├── clearCartMutation.ts
│   │       └── createCartMutation.ts
│   ├── mappers/                    # Data transformation
│   │   └── mapShopanaToEntityCart.ts
│   └── utils/
│       ├── cartId.ts               # Cart ID and cookies
│       └── cartMath.ts             # Cart math helpers
│
├── store/                          # Store abstraction
│   ├── CartStore.ts                # Store interface
│   └── createCartStore.ts          # Store factory
│
├── react/                          # React adapter
│   ├── context/                    # React context
│   │   └── CartContext.tsx
│   ├── providers/                  # Providers
│   │   └── CartProvider.tsx
│   ├── store/                      # Zustand implementation
│   │   └── CartStoreZustand.ts
│   └── hooks/                      # React hooks
│       ├── useCart.ts              # Main cart hook
│       ├── useCartId.ts
│       ├── useAddItemToCart.ts
│       ├── useRemoveItemFromCart.ts
│       ├── useUpdateCartLineQuantity.ts
│       ├── useReplaceCartItem.ts
│       ├── useClearCart.ts
│       ├── useCreateCart.ts
│       ├── useIsInTheCart.ts
│       ├── useCartFragment.ts
│       └── useCartLineFragment.ts
│
├── next/                           # Next.js adapter
│   └── loaders/
│       └── loadCartServerQuery.ts  # SSR cart loader
│
└── index.ts                        # Main export
```

### Key Components

#### 1. `CartStore` (Zustand)

Centralized cart state store:

```typescript
interface CartStore {
  cart: model.Cart | null;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
  setCart: (cart: model.Cart | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}
```

#### 2. `CartProvider`

React provider that:
- Initializes the store
- Loads the cart from cookies on mount
- Manages the cart lifecycle
- Provides context to child components
- Supports SSR through `initialCartData`

#### 3. Hooks

Hooks for cart operations:
- `useCart()` - get current cart state
- `useAddItemToCart()` - add products
- `useRemoveItemFromCart()` - remove products
- `useUpdateCartLineQuantity()` - update quantity
- `useReplaceCartItem()` - replace a product variant
- `useClearCart()` - clear the cart
- `useCreateCart()` - create a new cart

#### 4. GraphQL Integration

- All operations use Relay
- Types are generated automatically through `__generated__`
- Fragments are used for reusable data shapes

## Integration Stages

### Stage 1: Preparation

**Goal:** prepare the infrastructure for integration.

**Tasks:**

1. **Dependency analysis**
   - List all components that use the old cart
   - Check dependency version compatibility: React, Relay, Zustand
   - Document the old implementation API

2. **Backup**
   - Create feature branch `feat/cart-sdk-integration`
   - Preserve the old implementation with the `.old.tsx` suffix

3. **Configuration**

   ```typescript
   // src/config/cart.config.ts
   import { createCartConfig } from '@shopana/storefront-sdk/cart';

   export const cartConfig = createCartConfig({
     defaultCurrency: 'UAH',
     defaultLocale: 'uk',
     cookieName: 'shopana_cart_id',
     cookieOptions: {
       maxAge: 60 * 60 * 24 * 30, // 30 days
       path: '/',
       sameSite: 'lax',
     },
   });
   ```

**Result:** infrastructure is ready for integration.

### Stage 2: Integrate `CartProvider` into Root Layout

**Goal:** replace the old provider with the SDK provider.

**Tasks:**

1. **Create a store instance**

   ```typescript
   // src/store/cart.store.ts
   import { createCartStoreZustand } from '@shopana/storefront-sdk/cart';

   export const cartStore = createCartStoreZustand();
   ```

2. **Update Root Layout**

   ```typescript
   // src/app/layout.tsx
   'use client';

   import { getCurrentEnvironment } from '@src/relay/Environment';
   import { RelayEnvironmentProvider } from 'react-relay';
   import { ShopProvider } from '@shopana/storefront-sdk/shop';
   import { CartProvider } from '@shopana/storefront-sdk/cart';
   import { mockShopConfig } from '@shopana/storefront-sdk/shop/mockShopConfig';
   import { cartStore } from '@src/store/cart.store';
   import { cartConfig } from '@src/config/cart.config';

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <html lang="en" suppressHydrationWarning>
         <head>
           <title>Shopana</title>
         </head>
         <RelayEnvironmentProvider environment={getCurrentEnvironment()}>
           <ShopProvider config={mockShopConfig}>
             <CartProvider store={cartStore} config={cartConfig}>
               <body>
                 <div id="app">{children}</div>
                 <div id="sheet-wrapper"></div>
               </body>
             </CartProvider>
           </ShopProvider>
         </RelayEnvironmentProvider>
       </html>
     );
   }
   ```

3. **Remove the old provider**
   - Remove imports from `src/providers/cart/`
   - Rename old files to `*.old.tsx`
   - Update `src/providers/cart/index.ts`:

   ```typescript
   export { CartProvider } from '@shopana/storefront-sdk/cart';
   ```

**Result:** the SDK `CartProvider` is active across the application.

### Stage 3: Migrate Hooks

**Goal:** replace all old cart hooks with SDK hooks.

**Tasks:**

1. **Create a hooks barrel file**

   ```typescript
   // src/hooks/cart/index.ts
   export {
     useCart,
     useCartId,
     useAddItemToCart,
     useRemoveItemFromCart,
     useUpdateCartLineQuantity,
     useReplaceCartItem,
     useClearCart,
     useCreateCart,
     useIsInTheCart,
     useCartContext,
     useCartStore,
   } from '@shopana/storefront-sdk/cart';
   ```

2. **Update component imports**

   Before:

   ```typescript
   import { useCart } from '@src/hooks/cart/useCart';
   ```

   After:

   ```typescript
   import { useCart } from '@shopana/storefront-sdk/cart';
   // or
   import { useCart } from '@src/hooks/cart';
   ```

3. **Adapt types**
   - Update component props for SDK types
   - Replace `model.Cart` with SDK types when needed

4. **Mass replacement**

   ```bash
   grep -r "from '@src/hooks/cart/" src/
   ```

**Result:** all components use SDK hooks.

### Stage 4: Next.js SSR Integration

**Goal:** add server-side rendering support for the cart.

**Tasks:**

1. **Create an SSR loader utility**

   ```typescript
   // src/utils/cart/loadCartSSR.ts
   import { loadCartServerQuery } from '@shopana/storefront-sdk/cart/next';
   import { getCurrentEnvironment } from '@src/relay/Environment';

   export async function loadCartSSR(cartId: string) {
     const environment = getCurrentEnvironment();
     return loadCartServerQuery(environment, cartId);
   }
   ```

2. **Update page components**

   ```typescript
   // src/app/[locale]/(default)/page.tsx
   import { loadCartSSR } from '@src/utils/cart/loadCartSSR';
   import { cookies } from 'next/headers';

   export default async function HomePage() {
     const cartId = cookies().get('shopana_cart_id')?.value;
     const initialCartData = cartId ? await loadCartSSR(cartId) : null;

     return <ClientHomePage initialCartData={initialCartData} />;
   }
   ```

3. **Pass data into `CartProvider`**
   - Use the `initialCartData` prop for preloaded cart data

**Result:** cart data is loaded on the server for better UX.

### Stage 5: Update UI Components

**Goal:** adapt all cart UI components.

**Tasks:**
- Inventory components: `CartButton`, `CartIcon`, `CartDrawer`, `CartSheet`, `CartItem`, `CartSummary`, `CheckoutButton`, `MiniCart`
- Update each component to read cart data from the SDK
- Update add-to-cart forms to use `useAddItemToCart`

Example:

```typescript
'use client';

import { useCart } from '@shopana/storefront-sdk/cart';

export function CartButton() {
  const { cart, loading } = useCart();
  const itemCount = cart?.lines?.length ?? 0;

  return (
    <button className="relative">
      Cart
      {itemCount > 0 && <span>{itemCount}</span>}
    </button>
  );
}
```

**Result:** all UI components use the SDK.

### Stage 6: Update Tests

**Goal:** cover the new implementation with tests.

**Tasks:**
- Create SDK mocks
- Update existing test expectations
- Add integration tests for the cart provider and add-to-cart flow

### Stage 7: Optimization and Polish

**Goal:** improve performance and UX.

**Tasks:**
- Implement optimistic updates for mutations
- Add error handling
- Add analytics wrappers for cart actions
- Add loaders, success toasts, and update animations

## Existing Code Migration

### Old API to New API Mapping

| Old API | New API (SDK) | Notes |
| --- | --- | --- |
| `useCartContext()` | `useCartContext()` | Compatible, but with new types |
| `useCart()` | `useCart()` | Returns `{ cart, loading, loaded, error }` |
| `useAddToCart()` | `useAddItemToCart()` | New name, similar API |
| `useRemoveFromCart()` | `useRemoveItemFromCart()` | New name |
| `useUpdateQuantity()` | `useUpdateCartLineQuantity()` | More explicit name |
| `useClearCart()` | `useClearCart()` | Compatible |
| `cartKey` fragment | `cart` model | SDK uses data mapping |

### Per-Component Migration Checklist

- [ ] Update hook imports
- [ ] Update prop types
- [ ] Update cart data access
- [ ] Update mutation handlers
- [ ] Update tests
- [ ] Check behavior in dev mode
- [ ] Check SSR/SSG scenarios

### Application-Wide Checklist

- [ ] Update Root Layout
- [ ] Update configuration
- [ ] Create barrel exports
- [ ] Update documentation
- [ ] Run E2E validation
- [ ] Run a performance audit

## Testing

### Unit Tests

Test:
- Cart hooks in isolation
- Zustand store
- Data mapping
- Utilities: `cartId`, `cartMath`

Tools:
- Vitest
- `@testing-library/react`
- `@testing-library/react-hooks`

### Integration Tests

Test:
- `CartProvider` initialization
- Cart loading from cookies
- Add, remove, update, replace, and clear cart flows
- SSR hydration with `initialCartData`

### E2E Tests

Test:
- Add product to cart from product page
- Add product to cart from listing
- Open cart drawer
- Change quantity
- Remove item
- Go to checkout

## Potential Issues

1. **Relay environment mismatch**
   - Ensure the SDK and application use the same Relay environment instance.

2. **Cart ID synchronization**
   - Check cookie name and lifetime.
   - Ensure cart ID is cleared after checkout when required.

3. **Type mismatches**
   - Align application models with SDK models.
   - Avoid importing old cart fragments after migration.

4. **SSR hydration**
   - Confirm that `initialCartData` is passed only when available.
   - Avoid client/server state mismatches.

5. **Shopify provider support**
   - Keep provider-specific behavior behind the SDK boundary.

## Final Result

After the migration:
- The root app uses the SDK Cart module
- Cart state has one source of truth
- UI components no longer depend on old cart providers
- SSR cart loading is supported
- Cart mutations and hooks are reusable by other storefronts
