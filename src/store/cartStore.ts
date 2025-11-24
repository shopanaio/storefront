/**
 * Cart Store - SDK Integration
 *
 * This file creates a cart store instance using the SDK's cart module.
 * The store is created using createCartStoreZustand() from SDK and provides
 * a centralized state management solution for the cart functionality.
 *
 * @deprecated Old Zustand implementation moved to cartStore.old.ts
 * Now using SDK cart module for better consistency and maintainability
 */

import { createCartStoreZustand } from '@shopana/storefront-sdk/modules/cart/react';

/**
 * Global cart store instance (new format with { store, useStore })
 * This store is provided to CartProvider and used throughout the application
 */
const cartStoreInstance = createCartStoreZustand();

/**
 * Export the full store object (for CartProvider)
 */
export const cartStore = cartStoreInstance;

/**
 * Export Zustand hook for use with selectors
 * Use this in React components with selectors for optimized re-renders
 *
 * @example
 * ```tsx
 * // Select only cart data
 * const cart = useCartStore(s => s.cart);
 *
 * // Select multiple values
 * const { cart, loading } = useCartStore(s => ({ cart: s.cart, loading: s.loading }));
 * ```
 */
export const useCartStore = cartStoreInstance.useStore;
