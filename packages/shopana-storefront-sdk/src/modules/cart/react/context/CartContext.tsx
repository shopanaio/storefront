'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { CartStore, CartActions } from '../../store/CartStore';
import type { ErrorLike } from '@apollo/client';
import type { ResolvedCartConfig } from '../../core/config';
import type { CartIdUtils } from '../../core/utils/cartId';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { MutationQueueOptions } from '../../core/utils/mutationQueue';
import type {
  CurrencyCode,
  SdkCartFragment_CartFragment,
} from '../../../../graphql/apollo/generated/operations';

/** Active language and currency of the storefront; the cart follows them. */
export interface CartLocalization {
  /** Value of the API `LocaleCode`, e.g. `uk` or `pt_BR`. */
  languageCode: string;
  /** API `CurrencyCode`, e.g. `UAH`. */
  currencyCode: CurrencyCode;
}

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
   * Cart configuration (sales channel, cookies)
   */
  config: ResolvedCartConfig;

  /** Active language and currency new carts are created with and existing carts follow. */
  localization: CartLocalization;

  /**
   * Utilities for managing cart ID in cookies
   */
  cartIdUtils: CartIdUtils;

  /**
   * Current normalized cart data
   */
  cartKey: SdkCartFragment_CartFragment | null;

  /**
   * Set normalized cart data
   */
  setCartKey: (key: SdkCartFragment_CartFragment | null) => void;
  /**
   * Runs a write of the cart or its checkout after the writes queued before it; a waiting
   * write with the same `key` is replaced by this one.
   */
  enqueueMutation: <T>(
    operation: () => Promise<T>,
    options?: MutationQueueOptions
  ) => Promise<T>;
  /** Resolves once every write queued so far has settled. */
  waitForMutations: () => Promise<void>;
  /**
   * Calls `listener` with the checkout each confirmed cart write returns (lines added,
   * changed or removed). Returns the unsubscribe function.
   */
  subscribeCartUpdates: (
    listener: (checkout: SdkCartFragment_CartFragment | null) => void
  ) => () => void;
  /**
   * The server id of a line: a provisional line resolves to the line the server confirmed for
   * its purchasable. Null when the server has no such line.
   */
  getConfirmedLineId: (
    lineId: string,
    purchasableId: string | undefined
  ) => string | null;

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

  /**
   * Why the cart could not be loaded, when the server did not say it is missing. The cart id
   * is kept: the cart still exists and a retry loads it.
   */
  cartError: ErrorLike | null;

  /** Loads the cart again after `cartError`. */
  retryCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

type StableCartContextValue = Pick<
  CartContextValue,
  | 'store'
  | 'useStore'
  | 'config'
  | 'localization'
  | 'cartIdUtils'
  | 'setCartKey'
  | 'setId'
  | 'enqueueMutation'
  | 'waitForMutations'
  | 'subscribeCartUpdates'
  | 'getConfirmedLineId'
>;

const StableCartContext = createContext<StableCartContextValue | undefined>(
  undefined
);

export interface CartContextProviderProps {
  children: React.ReactNode;
  store: CartStore;
  useStore: UseBoundStore<StoreApi<CartStore>>;
  config: ResolvedCartConfig;
  localization: CartLocalization;
  cartIdUtils: CartIdUtils;
  cartKey: SdkCartFragment_CartFragment | null;
  setCartKey: (key: SdkCartFragment_CartFragment | null) => void;
  /**
   * Runs a write of the cart or its checkout after the writes queued before it; a waiting
   * write with the same `key` is replaced by this one.
   */
  enqueueMutation: <T>(
    operation: () => Promise<T>,
    options?: MutationQueueOptions
  ) => Promise<T>;
  /** Resolves once every write queued so far has settled. */
  waitForMutations: () => Promise<void>;
  /**
   * Calls `listener` with the checkout each confirmed cart write returns (lines added,
   * changed or removed). Returns the unsubscribe function.
   */
  subscribeCartUpdates: (
    listener: (checkout: SdkCartFragment_CartFragment | null) => void
  ) => () => void;
  getConfirmedLineId: (
    lineId: string,
    purchasableId: string | undefined
  ) => string | null;
  cartId: string | null;
  setId: (id: string | null) => void;
  isCartLoading: boolean;
  isCartLoaded: boolean;
  cartError: ErrorLike | null;
  retryCart: () => Promise<void>;
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
  localization,
  cartIdUtils,
  cartKey,
  setCartKey,
  enqueueMutation,
  waitForMutations,
  subscribeCartUpdates,
  getConfirmedLineId,
  cartId,
  setId,
  isCartLoading,
  isCartLoaded,
  cartError,
  retryCart,
}: CartContextProviderProps) {
  const value = useMemo<CartContextValue>(
    () => ({
      store,
      useStore,
      config,
      localization,
      cartIdUtils,
      cartKey,
      setCartKey,
      enqueueMutation,
      waitForMutations,
      subscribeCartUpdates,
      getConfirmedLineId,
      cartId,
      setId,
      isCartLoading,
      isCartLoaded,
      cartError,
      retryCart,
    }),
    [
      store,
      useStore,
      config,
      localization,
      cartIdUtils,
      cartKey,
      setCartKey,
      enqueueMutation,
      waitForMutations,
      subscribeCartUpdates,
      getConfirmedLineId,
      cartId,
      setId,
      isCartLoading,
      isCartLoaded,
      cartError,
      retryCart,
    ]
  );

  const stableValue = useMemo<StableCartContextValue>(
    () => ({
      store,
      useStore,
      config,
      localization,
      cartIdUtils,
      setCartKey,
      enqueueMutation,
      waitForMutations,
      subscribeCartUpdates,
      getConfirmedLineId,
      setId,
    }),
    [
      store,
      useStore,
      config,
      localization,
      cartIdUtils,
      setCartKey,
      setId,
      enqueueMutation,
      waitForMutations,
      subscribeCartUpdates,
      getConfirmedLineId,
    ]
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
  const {
    setCartKey,
    setId,
    enqueueMutation,
    waitForMutations,
    subscribeCartUpdates,
    getConfirmedLineId,
  } = useStableCartContext();
  return {
    setCartKey,
    setId,
    enqueueMutation,
    waitForMutations,
    subscribeCartUpdates,
    getConfirmedLineId,
  };
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
export function useCartConfig(): ResolvedCartConfig {
  const { config } = useStableCartContext();
  return config;
}

/**
 * Hook to access cart ID utilities
 *
 * @throws Error if used outside CartProvider
 */
export function useCartIdUtils(): CartIdUtils {
  const { cartIdUtils } = useStableCartContext();
  return cartIdUtils;
}

/**
 * Hook to access the active language and currency of the cart
 *
 * @throws Error if used outside CartProvider
 */
export function useCartLocalization(): CartLocalization {
  const { localization } = useStableCartContext();
  return localization;
}
