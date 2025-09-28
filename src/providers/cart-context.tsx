"use client";

import React, { createContext, useContext } from "react";
import { useCart_CartFragment$key } from "@src/hooks/cart/useCart/__generated__/useCart_CartFragment.graphql";

interface CartContextValue {
  cartKey: useCart_CartFragment$key | null;
  setCartKey: (key: useCart_CartFragment$key | null) => void;
  isCartLoading: boolean;
  isCartLoaded: boolean;
  setId: (id: string | null) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

interface CartContextProviderProps {
  children: React.ReactNode;
  cartKey: useCart_CartFragment$key | null;
  setCartKey: (key: useCart_CartFragment$key | null) => void;
  isCartLoading: boolean;
  isCartLoaded: boolean;
  setId: (id: string | null) => void;
}

export const CartContextProvider: React.FC<CartContextProviderProps> = ({
  children,
  cartKey,
  setCartKey,
  isCartLoading,
  isCartLoaded,
  setId,
}) => {
  return (
    <CartContext.Provider
      value={{
        cartKey,
        setCartKey,
        isCartLoading,
        isCartLoaded,
        setId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within CartContextProvider");
  }
  return context;
};
