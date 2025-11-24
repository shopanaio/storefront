"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useQueryLoader, usePreloadedQuery, useFragment } from "react-relay";
import { CartContextProvider } from "../cart-context";
import { useCart_CartFragment$key } from "@src/hooks/cart/useCartFragment/__generated__/useCart_CartFragment.graphql";
import { useCart_CartFragment } from "@src/hooks/cart/useCartFragment/useCart.shopify";
import cartIdUtils from "@src/utils/cartId";
import loadCartQuery from '@src/hooks/cart/loadCartQuery';
import { loadCartQuery as LoadCartQueryType } from '@src/hooks/cart/loadCartQuery/__generated__/loadCartQuery.graphql';

interface CartProviderProps {
  children: React.ReactNode;
  cookie: string;
}

// Separate component for handling cart data
const CartDataHandler: React.FC<{
  queryReference: NonNullable<
    ReturnType<typeof useQueryLoader<LoadCartQueryType>>[0]
  >;
  onCartData: (cart: useCart_CartFragment$key) => void;
  onCartNotFound: () => void;
}> = ({ queryReference, onCartData, onCartNotFound }) => {
  const cartData = usePreloadedQuery(loadCartQuery, queryReference);

  useEffect(() => {
    if (cartData && typeof cartData === "object" && "cart" in cartData) {
      if (cartData.cart) {
        onCartData(cartData.cart);
      } else if (cartData.cart === null) {
        onCartNotFound();
      }
    }
  }, [cartData, onCartData, onCartNotFound]);

  return null;
};

const CartProvider: React.FC<CartProviderProps> = ({
  children,
  cookie: cookieKey,
}) => {
  const [queryReference, loadQuery, disposeQuery] =
    useQueryLoader<LoadCartQueryType>(loadCartQuery);
  const [cartKey, setCartKey] = useState<useCart_CartFragment$key | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const isLoadingRef = useRef(false);
  const loadedRef = useRef(false);

  // This hook ensures that cart data won't be garbage collected by Relay
  // while CartProvider is mounted.
  useFragment(useCart_CartFragment, cartKey);

  /* console.log("queryReference", queryReference); */

  useEffect(() => {
    // Load cart only once when mounting on client
    if (loadedRef.current || isLoadingRef.current) return;

    const savedCartId = cartIdUtils.getCartIdFromCookie(cookieKey);
    /* console.log("[CartProvider Shopify] Checking for cart ID:", savedCartId); */

    if (!savedCartId) return;

    setCartId(savedCartId);
    isLoadingRef.current = true;
    setIsCartLoading(true);
    /* console.log("[CartProvider Shopify] Loading cart with ID:", savedCartId); */

    // Load query using useQueryLoader
    loadQuery({ id: savedCartId });
  }, [loadQuery, cookieKey]);

  const handleCartData = (cart: useCart_CartFragment$key) => {
    /* console.log("[CartProvider Shopify] Cart loaded successfully:", cart); */
    setCartKey(cart);
    setIsCartLoaded(true);
    isLoadingRef.current = false;
    setIsCartLoading(false);
    loadedRef.current = true;
  };

  const handleCartNotFound = () => {
    /* console.error("[CartProvider Shopify] Cart not found"); */
    isLoadingRef.current = false;
    setIsCartLoading(false);
    setCartKey(null);
    setCartId(null);
    loadedRef.current = true;
  };

  useEffect(() => {
    if (queryReference && !isCartLoaded && !isCartLoading) {
      setIsCartLoading(true);
    }
  }, [queryReference, isCartLoaded, isCartLoading]);

  // Clean up query on unmount
  useEffect(() => {
    return () => {
      if (disposeQuery) {
        disposeQuery();
      }
    };
  }, [disposeQuery]);

  // No auto-creation here; provider relies strictly on passed ID

  return (
    <CartContextProvider
      cartKey={cartKey}
      setCartKey={setCartKey}
      isCartLoading={isCartLoading}
      isCartLoaded={isCartLoaded}
      setId={(id) => {
        setCartId(id);
        cartIdUtils.setCartIdCookie(id, cookieKey);
      }}
      cartId={cartId}
    >
      <Suspense fallback={null}>
        {queryReference && (
          <CartDataHandler
            queryReference={queryReference}
            onCartData={handleCartData}
            onCartNotFound={handleCartNotFound}
          />
        )}
      </Suspense>
      {children}
    </CartContextProvider>
  );
};

export default CartProvider;
