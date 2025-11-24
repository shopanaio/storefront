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

/**
 * Cart provider component
 * Wraps your app to provide cart state and actions
 */
export function CartProvider({ children, store }: CartProviderProps) {
  return (
    <CartContext.Provider value={{ store }}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook to access cart store
 * Must be used within CartProvider
 */
export function useCartStore(): CartStore {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartStore must be used within CartProvider");
  }
  return context.store;
}
