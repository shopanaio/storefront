"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  PreloadedQuery,
  useFragment,
  usePreloadedQuery,
  useQueryLoader,
} from "react-relay";
import { loadCartQuery } from "@src/relay/queries/loadCartMutation.shopana";
import { loadCartMutationQuery as LoadCartQueryType } from "@src/relay/queries/__generated__/loadCartMutationQuery.graphql";
import { CartContextProvider } from "../cart-context";
import { useCart_CartFragment } from "@src/hooks/cart/useCart/useCart.shopana";
import { useCart_CartFragment$key } from "@src/hooks/cart/useCart/__generated__/useCart_CartFragment.graphql";

interface CartProviderProps {
  children: React.ReactNode;
  /**
   * Function to provide cart ID from specific source
   */
  getId: () => string | null;
}

type LoadCartQueryReference = PreloadedQuery<LoadCartQueryType>;

const CartDataHandler: React.FC<{
  queryReference: LoadCartQueryReference;
  onCartData: (cart: useCart_CartFragment$key) => void;
  onCartNotFound: () => void;
}> = ({ queryReference, onCartData, onCartNotFound }) => {
  const cartData = usePreloadedQuery<LoadCartQueryType>(
    loadCartQuery,
    queryReference
  );

  useEffect(() => {
    const checkout = cartData?.checkoutQuery?.checkout;

    if (checkout) {
      onCartData(checkout);
    } else if (checkout === null || checkout === undefined) {
      onCartNotFound();
    }
  }, [cartData, onCartData, onCartNotFound]);

  return null;
};

const CartProvider: React.FC<CartProviderProps> = ({
  children,
  getId
}) => {
  const [queryReference, loadQuery, disposeQuery] =
    useQueryLoader<LoadCartQueryType>(loadCartQuery);
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

    const cartId = getId();
    /* console.log("[CartProvider Shopana] Checking for cart ID:", cartId); */

    if (!cartId) {
      /* console.log("[CartProvider Shopana] No cart ID found"); */
      return;
    }

    isLoadingRef.current = true;
    setIsCartLoading(true);
    /* console.log("[CartProvider Shopana] Loading cart with ID:", cartId); */

    loadQuery({ checkoutId: cartId }, { fetchPolicy: "network-only" });
  }, [loadQuery, getId]);

  const handleCartData = useCallback(
    (cart: useCart_CartFragment$key) => {
      /* console.log("[CartProvider Shopana] Cart loaded successfully:", cart); */
      setCartKey(cart);
      setIsCartLoaded(true);
      isLoadingRef.current = false;
      setIsCartLoading(false);
      loadedRef.current = true;
    },
    []
  );

  const handleCartNotFound = useCallback(() => {
    /* console.log("[CartProvider Shopana] Cart not found, removing cookie"); */
    isLoadingRef.current = false;
    setIsCartLoading(false);
    setCartKey(null);
    setIsCartLoaded(true);
    loadedRef.current = true;
  }, []);

  useEffect(() => {
    return () => {
      if (disposeQuery) {
        disposeQuery();
      }
    };
  }, [disposeQuery]);

  return (
    <CartContextProvider
      cartKey={cartKey}
      setCartKey={setCartKey}
      isCartLoading={isCartLoading}
      isCartLoaded={isCartLoaded}
    >
      {queryReference ? (
        <CartDataHandler
          queryReference={queryReference}
          onCartData={handleCartData}
          onCartNotFound={handleCartNotFound}
        />
      ) : null}
      {children}
    </CartContextProvider>
  );
};

export default CartProvider;
