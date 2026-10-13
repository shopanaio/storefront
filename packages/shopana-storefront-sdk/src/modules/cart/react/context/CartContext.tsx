'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { CartStore, CartActions } from '../../store/CartStore';
import type { CartConfig } from '../../core/config';
import { createCartIdUtils } from '../../core/utils/cartId';
import type { UseBoundStore, StoreApi } from 'zustand';

/**
 * Cart context value providing store, config, and utilities
 */
export interface CartContextValue {
  /**
   * Cart store instance (Zustand or custom implementation)
   */
  store: CartStore;

  /**
   * Zustand hook for accessing state with selectors
   * Use this in React components: useCartStore(s => s.cart)
   */
  useStore: UseBoundStore<StoreApi<CartStore>>;

  /**
   * Cart configuration (currency, locale, cookies)
   */
  config: Required<CartConfig>;

  /**
   * Utilities for managing cart ID in cookies
   */
  cartIdUtils: ReturnType<typeof createCartIdUtils>;

  /**
   * Current normalized cart data
   */
  cartKey: any | null;

  /**
   * Set normalized cart data
   */
  setCartKey: (key: any | null) => void;

  /**
   * Current cart ID
   */
  cartId: string | null;

  /**
   * Set cart ID and save to cookies
   */
  setId: (id: string | null) => void;

  /**
   * Is cart currently loading
   */
  isCartLoading: boolean;

  /**
   * Has cart finished loading
   */
  isCartLoaded: boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

type StableCartContextValue = Pick<
  CartContextValue,
  'store' | 'useStore' | 'config' | 'cartIdUtils' | 'setCartKey' | 'setId'
>;

const StableCartContext = createContext<StableCartContextValue | undefined>(
  undefined
);

export interface CartContextProviderProps {
  children: React.ReactNode;
  store: CartStore;
  useStore: UseBoundStore<StoreApi<CartStore>>;
  config: Required<CartConfig>;
  cartKey: any | null;
  setCartKey: (key: any | null) => void;
  cartId: string | null;
  setId: (id: string | null) => void;
  isCartLoading: boolean;
  isCartLoaded: boolean;
}

/**
 * Internal Cart Context Provider
 * Provides cart store, config, and utilities to child components
 *
 * @internal This is used by the main CartProvider
 */
export function CartContextProvider({
  children,
  store,
  useStore,
  config,
  cartKey,
  setCartKey,
  cartId,
  setId,
  isCartLoading,
  isCartLoaded,
}: CartContextProviderProps) {
  // Create cart ID utils with config
  const cartIdUtils = useMemo(
    () =>
      createCartIdUtils({
        cookieName: config.cookieName,
        cookieOptions: config.cookieOptions,
      }),
    [config.cookieName, config.cookieOptions]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      store,
      useStore,
      config,
      cartIdUtils,
      cartKey,
      setCartKey,
      cartId,
      setId,
      isCartLoading,
      isCartLoaded,
    }),
    [
      store,
      useStore,
      config,
      cartIdUtils,
      cartKey,
      setCartKey,
      cartId,
      setId,
      isCartLoading,
      isCartLoaded,
    ]
  );

  const stableValue = useMemo<StableCartContextValue>(
    () => ({
      store,
      useStore,
      config,
      cartIdUtils,
      setCartKey,
      setId,
    }),
    [store, useStore, config, cartIdUtils, setCartKey, setId]
  );

  return (
    <StableCartContext.Provider value={stableValue}>
      <CartContext.Provider value={value}>{children}</CartContext.Provider>
    </StableCartContext.Provider>
  );
}

function useStableCartContext(): StableCartContextValue {
  const context = useContext(StableCartContext);
  if (!context) {
    throw new Error('Cart hooks must be used within CartProvider');
  }
  return context;
}

/**
 * Hook to access full cart context
 * Provides store, config, and utilities
 *
 * @throws Error if used outside CartProvider
 */
export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within CartProvider');
  }
  return context;
}

/**
 * Hook to access cart store (Zustand hook)
 * Returns the Zustand hook directly for use with selectors
 *
 * @example
 * ```tsx
 * // Select only cart data
 * const cart = useCartStore()(s => s.cart);
 *
 * // Select multiple values
 * const { cart, loading } = useCartStore()(s => ({ cart: s.cart, loading: s.loading }));
 *
 * // Or save to variable first
 * const useStore = useCartStore();
 * const cart = useStore(s => s.cart);
 * ```
 *
 * @throws Error if used outside CartProvider
 */
export function useCartStore() {
  const { useStore } = useStableCartContext();
  return useStore;
}

/** Returns the stable cart store object without subscribing to cart state. */
export function useCartStoreApi(): CartStore {
  const { store } = useStableCartContext();
  return store;
}

/** Returns stable cart setters without subscribing to cart metadata. */
export function useCartSetters() {
  const { setCartKey, setId } = useStableCartContext();
  return { setCartKey, setId };
}

/**
 * Hook to access cart actions/methods (without state)
 * Returns only action methods, not state properties
 * Use this when you need to call mutations like checkoutLinesAdd, checkoutLinesDelete, etc.
 *
 * @example
 * ```tsx
 * const actions = useCartActions();
 * actions.checkoutLinesAdd({ lines: [...] });
 * actions.checkoutClear();
 * ```
 *
 * @throws Error if used outside CartProvider
 */
export function useCartActions(): CartActions {
  const { store } = useStableCartContext();
  return store as CartActions;
}

/**
 * Hook to access cart configuration
 *
 * @throws Error if used outside CartProvider
 */
export function useCartConfig(): Required<CartConfig> {
  const { config } = useStableCartContext();
  return config;
}

/**
 * Hook to access cart ID utilities
 *
 * @throws Error if used outside CartProvider
 */
export function useCartIdUtils(): ReturnType<typeof createCartIdUtils> {
  const { cartIdUtils } = useStableCartContext();
  return cartIdUtils;
}
