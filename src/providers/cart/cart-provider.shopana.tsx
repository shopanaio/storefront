"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFragment, useMutation } from "react-relay";
import { loadCartMutation } from "@src/relay/queries/loadCartMutation.shopana";
import { loadCartMutation as LoadCartMutationType } from "@src/relay/queries/__generated__/loadCartMutation.graphql";
import cartIdUtils from "@src/utils/cartId";
import { CartContextProvider } from "../cart-context";
import { useCart_CartFragment } from "@src/hooks/cart/useCart/useCart.shopana";
import { useCart_CartFragment$key } from "@src/hooks/cart/useCart/__generated__/useCart_CartFragment.graphql";

interface CartProviderProps {
  children: React.ReactNode;
}

const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [commit] = useMutation<LoadCartMutationType>(loadCartMutation);
  const [cartKey, setCartKey] = useState<useCart_CartFragment$key | null>(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const isLoadingRef = useRef(false);
  const loadedRef = useRef(false);

  // This hook ensures that cart data won't be garbage collected by Relay
  // while CartProvider is mounted.
  useFragment(useCart_CartFragment, cartKey);

  useEffect(() => {
    // Load cart only once when mounting on client
    if (loadedRef.current || isLoadingRef.current) return;

    const cartId = cartIdUtils.getCartIdFromCookie();
    /* console.log("[CartProvider Shopana] Checking for cart ID:", cartId); */

    if (!cartId) {
      /* console.log("[CartProvider Shopana] No cart ID found in cookies"); */
      return;
    }

    isLoadingRef.current = true;
    setIsCartLoading(true);
    /* console.log("[CartProvider Shopana] Loading cart with ID:", cartId); */

    commit({
      variables: { input: { cartId } },
      onCompleted: (response, errors) => {
        isLoadingRef.current = false;
        setIsCartLoading(false);
        loadedRef.current = true;
        setIsCartLoaded(true);

        if (errors && errors.length > 0) {
          /* console.error("[CartProvider Shopana] Error loading cart:", errors); */
        } else if (
          response?.loadCart?.errors &&
          response.loadCart.errors.length > 0
        ) {
          /* console.error(
            "[CartProvider Shopana] Cart loading errors:",
            response.loadCart.errors
          ); */
        } else if (!response?.loadCart?.cart) {
          // If cart not found, remove cookie
          /* console.log("[CartProvider Shopana] Cart not found, removing cookie"); */
          cartIdUtils.removeCartIdCookie();
          setCartKey(null);
        } else if (response?.loadCart?.cart) {
          // Setting cart fragment key
          /* console.log(
            "[CartProvider Shopana] Cart loaded successfully:",
            response.loadCart.cart
          ); */
          setCartKey(response.loadCart.cart);
        }
      },
      onError: (err) => {
        isLoadingRef.current = false;
        setIsCartLoading(false);
        /* console.error("[CartProvider Shopana] Failed to load cart:", err); */
      },
    });
  }, [commit]);

  return (
    <CartContextProvider
      cartKey={cartKey}
      setCartKey={setCartKey}
      isCartLoading={isCartLoading}
      isCartLoaded={isCartLoaded}
    >
      {children}
    </CartContextProvider>
  );
};

export default CartProvider;
