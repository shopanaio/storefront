# Cart Module Migration Plan

## 📋 Overview

This document describes the migration plan for moving the cart module from the root project into the SDK with a modular, framework-agnostic architecture.

---

## 🎯 Goals

1. **Framework-agnostic core** - GraphQL operations, types, and utilities work without React/Next.js
2. **React adapter** - React hooks and context for easy integration
3. **Next.js adapter** - SSR loaders and server-side utilities
4. **Shopana-only** - Remove cmsPick abstraction, use only Shopana implementation
5. **Modular structure** - Clear separation of concerns (core, store, react, next)

---

## 🏗️ Target Architecture

```
packages/shopana-storefront-sdk/src/modules/cart/
│
├── core/                           # ✅ Framework-agnostic
│   ├── types.ts                    # TypeScript interfaces
│   ├── graphql/
│   │   ├── queries/
│   │   │   ├── loadCartQuery.ts
│   │   │   └── index.ts
│   │   ├── mutations/
│   │   │   ├── addToCartMutation.ts
│   │   │   ├── removeFromCartMutation.ts
│   │   │   ├── clearCartMutation.ts
│   │   │   ├── createCartMutation.ts
│   │   │   ├── updateCartLineMutation.ts
│   │   │   ├── replaceCartItemMutation.ts
│   │   │   └── index.ts
│   │   └── fragments/
│   │       ├── CartFragment.ts
│   │       ├── CartLineFragment.ts
│   │       └── index.ts
│   ├── mappers/
│   │   ├── mapShopanaToEntityCart.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── cartId.ts
│   │   ├── cartMath.ts
│   │   └── index.ts
│   └── index.ts
│
├── store/                          # ✅ Framework-agnostic state abstraction
│   ├── CartStore.ts                # Interface definition
│   ├── createCartStore.ts          # Factory function
│   └── index.ts
│
├── react/                          # ⚛️ React adapter
│   ├── context/
│   │   ├── CartContext.tsx
│   │   ├── CartProvider.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useCart.ts
│   │   ├── useAddItemToCart.ts
│   │   ├── useRemoveItemFromCart.ts
│   │   ├── useClearCart.ts
│   │   ├── useCreateCart.ts
│   │   ├── useUpdateCartLine.ts
│   │   ├── useReplaceCartItem.ts
│   │   ├── useIsInTheCart.ts
│   │   ├── useCartId.ts
│   │   └── index.ts
│   ├── store/
│   │   └── CartStoreZustand.ts     # Zustand implementation
│   └── index.ts
│
├── next/                           # 🔺 Next.js adapter
│   ├── loaders/
│   │   ├── loadCartServerQuery.ts
│   │   └── index.ts
│   └── index.ts
│
└── index.ts                        # Main module export
```

---

## 📦 File Inventory

### ✅ Already Created

#### `core/types.ts`
```typescript
export interface AddToCartInput { ... }
export interface RemoveFromCartInput { ... }
export interface ClearCartInput { ... }
export interface UpdateCartLineInput { ... }
export interface ReplaceCartItemInput { ... }
export interface CreateCartInput { ... }
export interface MutationOptions { ... }
```

#### `core/graphql/fragments/`
- ✅ `CartFragment.ts` - Fragment for checkout data
- ✅ `CartLineFragment.ts` - Fragment for checkout line (@inline)
- ✅ `index.ts`

#### `core/graphql/queries/`
- ✅ `loadCartQuery.ts` - Query for loading cart by ID
- ✅ `index.ts`

#### `core/graphql/mutations/`
- ✅ `addToCartMutation.ts` - checkoutLinesAdd
- ✅ `removeFromCartMutation.ts` - checkoutLinesDelete
- ✅ `clearCartMutation.ts` - checkoutLinesClear
- ❌ `createCartMutation.ts` - checkoutCreate (TODO)
- ❌ `updateCartLineMutation.ts` - checkoutLinesUpdate (TODO)
- ❌ `replaceCartItemMutation.ts` - checkoutLinesReplace (TODO)
- ❌ `index.ts` (TODO)

---

### 📋 TODO: Files to Create

#### 1. Complete GraphQL Mutations

**Source:** `src/hooks/cart/useCreateCart/useCreateCart.shopana.ts`
```typescript
// core/graphql/mutations/createCartMutation.ts
export const createCartMutation = graphql`
  mutation useCreateCartMutation($input: CheckoutCreateInput!) {
    checkoutMutation {
      checkoutCreate(input: $input) {
        id
        ...useCart_CartFragment
      }
    }
  }
`;
```

**Source:** `src/hooks/cart/useUpdateCartLineQuantity/useUpdateCartLineQuantity.shopana.ts`
```typescript
// core/graphql/mutations/updateCartLineMutation.ts
export const updateCartLineMutation = graphql`
  mutation useUpdateCartLineQuantityMutation($input: CheckoutLinesUpdateInput!) {
    checkoutMutation {
      checkoutLinesUpdate(input: $input) {
        checkout {
          id
          ...useCart_CartFragment
        }
        errors {
          field
          message
        }
      }
    }
  }
`;
```

**Source:** `src/hooks/cart/useReplaceCartItem/useReplaceCartItem.shopana.ts`
```typescript
// core/graphql/mutations/replaceCartItemMutation.ts
export const replaceCartItemMutation = graphql`
  mutation useReplaceCartItemMutation($input: CheckoutLinesReplaceInput!) {
    checkoutMutation {
      checkoutLinesReplace(input: $input) {
        checkout {
          id
          ...useCart_CartFragment
        }
        errors {
          field
          message
        }
      }
    }
  }
`;
```

**Create:** `core/graphql/mutations/index.ts`
```typescript
export { addToCartMutation } from './addToCartMutation';
export { removeFromCartMutation } from './removeFromCartMutation';
export { clearCartMutation } from './clearCartMutation';
export { createCartMutation } from './createCartMutation';
export { updateCartLineMutation } from './updateCartLineMutation';
export { replaceCartItemMutation } from './replaceCartItemMutation';
```

---

#### 2. Mappers

**Source:** `src/hooks/cart/mappers/mapShopanaToEntityCart.ts`
```typescript
// core/mappers/mapShopanaToEntityCart.ts
import type { model } from '../../../model';

export function mapShopanaCheckoutToEntityCart(checkout: any): model.Cart {
  return checkout as model.Cart;
}
```

**Create:** `core/mappers/index.ts`
```typescript
export { mapShopanaCheckoutToEntityCart } from './mapShopanaToEntityCart';
```

---

#### 3. Utils

**Source:** `src/utils/cartId/cartId.shopana.ts`
```typescript
// core/utils/cartId.ts
import Cookies from 'js-cookie';

const CART_ID_COOKIE_NAME = 'cartId';

export const cartIdUtils = {
  getCartIdFromCookie(serverCookies?: string): string | null {
    if (typeof window === 'undefined') {
      if (serverCookies) {
        const match = serverCookies.match(/(?:^|; )cartId=([^;]*)/);
        return match ? decodeURIComponent(match[1]) : null;
      }
      return null;
    }
    return Cookies.get(CART_ID_COOKIE_NAME) ?? null;
  },

  setCartIdCookie(cartId: string, options = {}): void {
    const {
      secure = true,
      sameSite = 'strict' as const,
      maxAge = 3600 * 24 * 30, // 30 days
    } = options;

    const expiresInDays = maxAge / (3600 * 24);

    Cookies.set(CART_ID_COOKIE_NAME, cartId, {
      path: '/',
      secure,
      sameSite,
      expires: expiresInDays,
    });
  },

  removeCartIdCookie(): void {
    if (typeof window === 'undefined') return;
    Cookies.remove(CART_ID_COOKIE_NAME);
  },
};
```

**Source:** `src/store/cartMath.ts`
```typescript
// core/utils/cartMath.ts
import type { model } from '../../../model';

/**
 * Recalculate cart totals based on line items
 */
export function recalcCart(cart: model.Cart): model.Cart {
  // Implementation from src/store/cartMath.ts
  // Calculate subtotal, tax, shipping, total from lines
  return cart;
}
```

**Create:** `core/utils/index.ts`
```typescript
export { cartIdUtils } from './cartId';
export { recalcCart } from './cartMath';
```

---

#### 4. Core Index

**Create:** `core/index.ts`
```typescript
// Types
export * from './types';

// GraphQL
export * from './graphql/queries';
export * from './graphql/mutations';
export * from './graphql/fragments';

// Mappers
export * from './mappers';

// Utils
export * from './utils';
```

---

#### 5. Store Abstraction

**Create:** `store/CartStore.ts`
```typescript
import type { model } from '../../model';

/**
 * Cart store interface - framework-agnostic
 * Can be implemented with Zustand, Redux, MobX, or any state manager
 */
export interface CartStore {
  // State
  cart: model.Cart | null;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
  version: number;

  // Actions
  setCart(cart: model.Cart | null): void;

  // Optimistic updates (with revert capability)
  optimisticAdd(input: {
    lines: Array<{
      purchasableId: string;
      quantity: number;
      children?: Array<{ quantity: number }>;
    }>;
    pricing?: Record<
      string,
      { unitPrice: number; compareAtUnitPrice?: number; currencyCode: string }
    >;
  }): { version: number; revert(): void };

  optimisticRemove(lineIds: string[]): { version: number; revert(): void };

  optimisticUpdate(input: {
    lines: Array<{ lineId: string; quantity: number }>;
  }): { version: number; revert(): void };

  optimisticReplace(input: {
    lines: Array<{ lineId: string; purchasableId: string; quantity?: number }>;
    pricing?: Record<
      string,
      { unitPrice: number; compareAtUnitPrice?: number; currencyCode: string }
    >;
  }): { version: number; revert(): void };

  optimisticClear(): { version: number; revert(): void };
}

/**
 * Store implementation interface for dependency injection
 */
export interface StoreImplementation<T> {
  getState(): T;
  setState(state: T | ((prev: T) => T)): void;
  subscribe(listener: (state: T) => void): () => void;
}
```

**Create:** `store/createCartStore.ts`
```typescript
import { CartStore, StoreImplementation } from './CartStore';
import type { model } from '../../model';
import { recalcCart } from '../core/utils';

/**
 * Factory function to create cart store with any state manager
 * This allows using Zustand, Redux, MobX, or custom implementation
 */
export function createCartStore(
  impl: StoreImplementation<CartStore>
): CartStore {
  const store: CartStore = {
    get cart() { return impl.getState().cart; },
    get loading() { return impl.getState().loading; },
    get loaded() { return impl.getState().loaded; },
    get error() { return impl.getState().error; },
    get version() { return impl.getState().version; },

    setCart(cart: model.Cart | null) {
      impl.setState({
        ...impl.getState(),
        cart,
        loading: false,
        loaded: true,
        error: null,
      });
    },

    optimisticAdd(input) {
      const state = impl.getState();
      if (!state.cart) return { version: state.version, revert: () => {} };

      const prev = state.cart;
      const base = state.cart;
      const nextLines = [...base.lines];

      // Add logic from src/store/cartStore.ts
      // (implementation details)

      const nextCart = recalcCart({ ...base, lines: nextLines });
      const nextVersion = state.version + 1;

      impl.setState({
        ...state,
        cart: nextCart,
        version: nextVersion,
      });

      return {
        version: nextVersion,
        revert: () => {
          impl.setState({ ...impl.getState(), cart: prev });
        },
      };
    },

    optimisticRemove(lineIds) {
      // Implementation similar to optimisticAdd
      // ...
      return { version: 0, revert: () => {} };
    },

    optimisticUpdate(input) {
      // Implementation
      // ...
      return { version: 0, revert: () => {} };
    },

    optimisticReplace(input) {
      // Implementation
      // ...
      return { version: 0, revert: () => {} };
    },

    optimisticClear() {
      // Implementation
      // ...
      return { version: 0, revert: () => {} };
    },
  };

  return store;
}
```

**Create:** `store/index.ts`
```typescript
export type { CartStore, StoreImplementation } from './CartStore';
export { createCartStore } from './createCartStore';
```

---

#### 6. React Context

**Create:** `react/context/CartContext.tsx`
```typescript
"use client";

import React, { createContext, useContext } from "react";
import { CartStore } from "../../store";

interface CartContextValue {
  store: CartStore;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

interface CartProviderProps {
  children: React.ReactNode;
  store: CartStore;
}

export function CartProvider({ children, store }: CartProviderProps) {
  return (
    <CartContext.Provider value={{ store }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartStore(): CartStore {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartStore must be used within CartProvider");
  }
  return context.store;
}
```

**Create:** `react/context/index.ts`
```typescript
export { CartProvider, useCartStore } from './CartContext';
```

---

#### 7. React Hooks

**Create:** `react/hooks/useCart.ts`
```typescript
"use client";

import { useCartStore } from '../context';
import type { model } from '../../../model';

export interface UseCartReturn {
  cart: model.Cart | null;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
}

/**
 * Hook to access cart state
 */
export function useCart(): UseCartReturn {
  const store = useCartStore();

  return {
    cart: store.cart,
    loading: store.loading,
    loaded: store.loaded,
    error: store.error,
  };
}
```

**Create:** `react/hooks/useAddItemToCart.ts`
```typescript
"use client";

import { useMutation } from 'react-relay';
import { useCartStore } from '../context';
import { addToCartMutation } from '../../core/graphql/mutations';
import { AddToCartInput, MutationOptions } from '../../core/types';
import { useCreateCart } from './useCreateCart';

export interface UseAddItemToCartReturn {
  addToCart(input: AddToCartInput, options?: MutationOptions): Promise<any>;
  isInFlight: boolean;
}

/**
 * Hook for adding items to cart
 * Handles optimistic updates with Zustand store
 */
export function useAddItemToCart(): UseAddItemToCartReturn {
  const store = useCartStore();
  const { createCart } = useCreateCart();
  const [commit, isInFlight] = useMutation(addToCartMutation);

  const addToCart = async (
    input: AddToCartInput,
    options?: MutationOptions
  ): Promise<any> => {
    // If no cart - create new one
    if (!store.cart?.id) {
      return createCart(
        {
          currencyCode: 'USD', // TODO: get from config
          localeCode: 'en',    // TODO: get from config
          items: [
            {
              purchasableId: input.purchasableId,
              quantity: input.quantity,
              children: input.children,
            },
          ],
        },
        options
      );
    }

    // Optimistic update
    const { revert } = store.optimisticAdd({
      lines: [
        {
          purchasableId: input.purchasableId,
          quantity: input.quantity,
          children: input.children,
        },
      ],
      pricing: {
        [input.purchasableId]: {
          unitPrice: input.purchasableSnapshot.price.amount,
          compareAtUnitPrice: input.purchasableSnapshot.compareAtPrice?.amount,
          currencyCode: input.purchasableSnapshot.price.currencyCode,
        },
      },
    });

    // Commit mutation
    return new Promise((resolve, reject) => {
      commit({
        variables: {
          input: {
            checkoutId: store.cart!.id,
            lines: [
              {
                purchasableId: input.purchasableId,
                quantity: input.quantity,
              },
            ],
          },
        },
        onCompleted: (response, errors) => {
          if (errors?.length) {
            revert();
            options?.onError?.(errors);
            return reject(errors);
          }

          const result = response?.checkoutMutation?.checkoutLinesAdd;
          if (result?.errors?.length) {
            revert();
            options?.onError?.(result.errors);
            return reject(result.errors);
          }

          // Update store with server response
          if (result?.checkout) {
            store.setCart(result.checkout as any);
          }

          options?.onSuccess?.();
          resolve(result?.checkout);
        },
        onError: (error) => {
          revert();
          options?.onError?.(error);
          reject(error);
        },
      });
    });
  };

  return { addToCart, isInFlight };
}
```

**Similarly create:**
- `useRemoveItemFromCart.ts`
- `useClearCart.ts`
- `useCreateCart.ts`
- `useUpdateCartLine.ts`
- `useReplaceCartItem.ts`
- `useIsInTheCart.ts`
- `useCartId.ts`

**Create:** `react/hooks/index.ts`
```typescript
export { useCart } from './useCart';
export { useAddItemToCart } from './useAddItemToCart';
export { useRemoveItemFromCart } from './useRemoveItemFromCart';
export { useClearCart } from './useClearCart';
export { useCreateCart } from './useCreateCart';
export { useUpdateCartLine } from './useUpdateCartLine';
export { useReplaceCartItem } from './useReplaceCartItem';
export { useIsInTheCart } from './useIsInTheCart';
export { useCartId } from './useCartId';

export type { UseCartReturn } from './useCart';
export type { UseAddItemToCartReturn } from './useAddItemToCart';
// ... other return types
```

---

#### 8. React Store Implementation (Zustand)

**Create:** `react/store/CartStoreZustand.ts`
```typescript
import { create } from 'zustand';
import { CartStore, createCartStore } from '../../store';

/**
 * Create cart store using Zustand
 * This is the default React implementation
 */
export function createCartStoreZustand(): CartStore {
  const useZustandStore = create<CartStore>(() => ({
    cart: null,
    loading: false,
    loaded: false,
    error: null,
    version: 0,
    setCart: () => {},
    optimisticAdd: () => ({ version: 0, revert: () => {} }),
    optimisticRemove: () => ({ version: 0, revert: () => {} }),
    optimisticUpdate: () => ({ version: 0, revert: () => {} }),
    optimisticReplace: () => ({ version: 0, revert: () => {} }),
    optimisticClear: () => ({ version: 0, revert: () => {} }),
  }));

  return createCartStore({
    getState: () => useZustandStore.getState(),
    setState: (updater) => {
      if (typeof updater === 'function') {
        useZustandStore.setState(updater);
      } else {
        useZustandStore.setState(updater);
      }
    },
    subscribe: (listener) => useZustandStore.subscribe(listener),
  });
}
```

---

#### 9. React Index

**Create:** `react/index.ts`
```typescript
// Context
export { CartProvider, useCartStore } from './context';

// Hooks
export * from './hooks';

// Store implementation
export { createCartStoreZustand } from './store/CartStoreZustand';
```

---

#### 10. Next.js Adapter

**Create:** `next/loaders/loadCartServerQuery.ts`
```typescript
import { headers } from 'next/headers';
import { loadSerializableQuery } from '../../../graphql/relay';
import { loadCartQuery } from '../../core/graphql/queries';
import { cartIdUtils } from '../../core/utils';

/**
 * Load cart data on server (Next.js)
 */
export async function loadCartServerQuery() {
  const cookie = (await headers()).get('cookie') ?? undefined;
  const cartId = cartIdUtils.getCartIdFromCookie(cookie);

  if (!cartId) {
    return null;
  }

  const preloadedQuery = await loadSerializableQuery(
    loadCartQuery,
    { checkoutId: cartId },
    cookie
  );

  return preloadedQuery;
}
```

**Create:** `next/loaders/index.ts`
```typescript
export { loadCartServerQuery } from './loadCartServerQuery';
```

**Create:** `next/index.ts`
```typescript
export * from './loaders';
```

---

#### 11. Main Module Export

**Create:** `modules/cart/index.ts`
```typescript
// Core (framework-agnostic)
export * from './core';

// Store abstraction
export * from './store';

// React adapter
export * from './react';

// Next.js adapter
export * from './next';
```

---

## 📦 Package.json Updates

Add to `packages/shopana-storefront-sdk/package.json`:

```json
{
  "exports": {
    // ... existing exports

    "./modules/cart": {
      "types": "./dist/modules/cart/index.d.ts",
      "default": "./dist/modules/cart/index.js"
    },
    "./modules/cart/core": {
      "types": "./dist/modules/cart/core/index.d.ts",
      "default": "./dist/modules/cart/core/index.js"
    },
    "./modules/cart/store": {
      "types": "./dist/modules/cart/store/index.d.ts",
      "default": "./dist/modules/cart/store/index.js"
    },
    "./modules/cart/react": {
      "types": "./dist/modules/cart/react/index.d.ts",
      "default": "./dist/modules/cart/react/index.js"
    },
    "./modules/cart/next": {
      "types": "./dist/modules/cart/next/index.d.ts",
      "default": "./dist/modules/cart/next/index.js"
    }
  },
  "peerDependencies": {
    "zustand": "^4.0.0 || ^5.0.0"
  }
}
```

---

## 🔄 Usage Examples

### In Next.js Project

```typescript
// app/layout.tsx (Server Component)
import { CartProvider } from '@shopana/storefront-sdk/modules/cart/react';
import { createCartStoreZustand } from '@shopana/storefront-sdk/modules/cart/react';

const cartStore = createCartStoreZustand();

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CartProvider store={cartStore}>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

// components/AddToCartButton.tsx (Client Component)
'use client';
import { useAddItemToCart } from '@shopana/storefront-sdk/modules/cart/react';

export function AddToCartButton({ variant }) {
  const { addToCart, isInFlight } = useAddItemToCart();

  return (
    <button
      onClick={() => addToCart({
        purchasableId: variant.id,
        purchasableSnapshot: variant,
        quantity: 1,
      })}
      disabled={isInFlight}
    >
      Add to Cart
    </button>
  );
}

// app/cart/page.tsx (Server Component)
import { loadCartServerQuery } from '@shopana/storefront-sdk/modules/cart/next';

export default async function CartPage() {
  const cartData = await loadCartServerQuery();
  return <CartClient initialData={cartData} />;
}
```

### In Remix Project

```typescript
// app/root.tsx
import { CartProvider } from '@shopana/storefront-sdk/modules/cart/react';
import { createCartStoreZustand } from '@shopana/storefront-sdk/modules/cart/react';

const cartStore = createCartStoreZustand();

export default function App() {
  return (
    <CartProvider store={cartStore}>
      <Outlet />
    </CartProvider>
  );
}

// app/routes/cart.tsx
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { loadCartQuery } from '@shopana/storefront-sdk/modules/cart/core/graphql/queries';
import { cartIdUtils } from '@shopana/storefront-sdk/modules/cart/core/utils';

export async function loader({ request }: LoaderFunctionArgs) {
  const cookie = request.headers.get('Cookie');
  const cartId = cartIdUtils.getCartIdFromCookie(cookie);

  // Use core GraphQL directly
  const cart = await fetchQuery(loadCartQuery, { checkoutId: cartId });
  return json({ cart });
}

// components/AddToCartButton.tsx
import { useAddItemToCart } from '@shopana/storefront-sdk/modules/cart/react';

export function AddToCartButton({ variant }) {
  const { addToCart } = useAddItemToCart();
  // Same API as Next.js!
  return <button onClick={() => addToCart({...})}>Add to Cart</button>;
}
```

### Using Only Core (No React)

```typescript
// In any JS/TS project
import {
  addToCartMutation,
  loadCartQuery
} from '@shopana/storefront-sdk/modules/cart/core/graphql';

import { createCartStore } from '@shopana/storefront-sdk/modules/cart/store';

// Create custom store implementation
const cartStore = createCartStore({
  getState: () => myState,
  setState: (newState) => { myState = newState; },
  subscribe: (listener) => { /* ... */ }
});

// Use GraphQL directly
const cart = await fetchGraphQL(loadCartQuery, { checkoutId });
```

---

## 📊 Migration Checklist

### Phase 1: Complete Core Layer ✅ (Partially Done)

- [x] Create directory structure
- [x] `core/types.ts` - All interfaces
- [x] `core/graphql/fragments/` - CartFragment, CartLineFragment
- [x] `core/graphql/queries/` - loadCartQuery
- [x] `core/graphql/mutations/` - addToCart, removeFromCart, clearCart
- [ ] `core/graphql/mutations/` - createCart, updateCartLine, replaceCartItem
- [ ] `core/mappers/` - mapShopanaToEntityCart
- [ ] `core/utils/` - cartId, cartMath
- [ ] `core/index.ts` - Export all core

### Phase 2: Store Abstraction

- [ ] `store/CartStore.ts` - Interface definition
- [ ] `store/createCartStore.ts` - Factory function with optimistic updates
- [ ] `store/index.ts`

### Phase 3: React Adapter

- [ ] `react/context/CartContext.tsx` - Context + Provider
- [ ] `react/hooks/useCart.ts`
- [ ] `react/hooks/useAddItemToCart.ts`
- [ ] `react/hooks/useRemoveItemFromCart.ts`
- [ ] `react/hooks/useClearCart.ts`
- [ ] `react/hooks/useCreateCart.ts`
- [ ] `react/hooks/useUpdateCartLine.ts`
- [ ] `react/hooks/useReplaceCartItem.ts`
- [ ] `react/hooks/useIsInTheCart.ts`
- [ ] `react/hooks/useCartId.ts`
- [ ] `react/store/CartStoreZustand.ts` - Zustand implementation
- [ ] `react/index.ts`

### Phase 4: Next.js Adapter

- [ ] `next/loaders/loadCartServerQuery.ts`
- [ ] `next/index.ts`

### Phase 5: Integration

- [ ] `modules/cart/index.ts` - Main export
- [ ] Update `package.json` exports
- [ ] Build SDK: `yarn build`

### Phase 6: Root Project Migration

- [ ] Update imports from `@src/hooks/cart/*` to `@shopana/storefront-sdk/modules/cart/react`
- [ ] Update imports from `@src/utils/cartId` to `@shopana/storefront-sdk/modules/cart/core/utils`
- [ ] Update imports from `@src/store/cartStore` to use new CartProvider
- [ ] Test all cart functionality
- [ ] Remove old cart files from `src/hooks/cart/`

---

## 🎯 Benefits of This Architecture

1. **Framework-agnostic Core**
   - GraphQL operations work in any environment
   - No React/Next.js dependencies in core

2. **Portable State Management**
   - CartStore interface can be implemented with any state manager
   - Easy to swap Zustand for Redux, MobX, etc.

3. **Modular Imports**
   - Import only what you need
   - Smaller bundle sizes

4. **Framework Adapters**
   - React adapter with hooks
   - Next.js adapter with SSR
   - Easy to add Remix, Vue, Svelte adapters

5. **Type Safety**
   - Full TypeScript support across all layers
   - Generated types from Relay

6. **Testability**
   - Core logic easily testable without React
   - Store logic testable independently

7. **Reusability**
   - Same cart logic across Next.js and Remix projects
   - Share GraphQL operations between projects

---

## 📝 Notes

- This plan removes cmsPick - uses only Shopana implementation
- Zustand is the default state manager but can be replaced
- All GraphQL mutations include optimistic updates
- Store version tracking for debugging and revert capability
- Full TypeScript types from Relay compiler

---

## 🚀 Next Steps

1. Complete remaining mutations in `core/graphql/mutations/`
2. Implement mappers and utils in `core/`
3. Create store abstraction layer
4. Build React hooks with optimistic updates
5. Create Next.js loaders
6. Update package.json and build
7. Migrate root project imports
8. Test thoroughly
9. Document usage examples

---

**Last Updated:** 2024-11-24
**Status:** In Progress (Phase 1: ~60% complete)
