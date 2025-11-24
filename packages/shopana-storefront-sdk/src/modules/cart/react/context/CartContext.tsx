"use client";

import React, { createContext, useContext, useMemo } from "react";
import { CartStore } from "../../store";
import type { CartConfig } from "../../core/config";
import { createCartIdUtils } from "../../core/utils/cartId";

/**
 * Cart context value providing store, config, and utilities
 */
export interface CartContextValue {
  /**
   * Cart store instance (Zustand or custom implementation)
   */
  store: CartStore;

  /**
   * Cart configuration (currency, locale, cookies)
   */
  config: Required<CartConfig>;

  /**
   * Utilities for managing cart ID in cookies
   */
  cartIdUtils: ReturnType<typeof createCartIdUtils>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export interface CartContextProviderProps {
  children: React.ReactNode;
  store: CartStore;
  config: Required<CartConfig>;
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
  config
}: CartContextProviderProps) {
  // Create cart ID utils with config
  const cartIdUtils = useMemo(
    () => createCartIdUtils({
      cookieName: config.cookieName,
      cookieOptions: config.cookieOptions,
    }),
    [config.cookieName, config.cookieOptions]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      store,
      config,
      cartIdUtils,
    }),
    [store, config, cartIdUtils]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
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
    throw new Error("useCartContext must be used within CartProvider");
  }
  return context;
}

/**
 * Hook to access cart store only
 *
 * @throws Error if used outside CartProvider
 */
export function useCartStore(): CartStore {
  const { store } = useCartContext();
  return store;
}

/**
 * Hook to access cart configuration
 *
 * @throws Error if used outside CartProvider
 */
export function useCartConfig(): Required<CartConfig> {
  const { config } = useCartContext();
  return config;
}

/**
 * Hook to access cart ID utilities
 *
 * @throws Error if used outside CartProvider
 */
export function useCartIdUtils(): ReturnType<typeof createCartIdUtils> {
  const { cartIdUtils } = useCartContext();
  return cartIdUtils;
}
