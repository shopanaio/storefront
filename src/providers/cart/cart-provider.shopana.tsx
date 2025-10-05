"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { PreloadedQuery, usePreloadedQuery, useQueryLoader } from "react-relay";
import { loadCartQuery } from "@src/relay/queries/loadCartMutation.shopana";
import { loadCartMutationQuery as LoadCartQueryType } from "@src/relay/queries/__generated__/loadCartMutationQuery.graphql";
import { CartContextProvider } from "../cart-context";
import { useCart_CartFragment$key } from "@src/hooks/cart/useCart/__generated__/useCart_CartFragment.graphql";
import cartIdUtils from "@src/utils/cartId";

interface CartProviderProps {
  children: React.ReactNode;
  cookie: string;
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
    } else {
      console.log("Cart not found");
      onCartNotFound();
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
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const isLoadingRef = useRef(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || isLoadingRef.current) return;

    const cartId = cartIdUtils.getCartIdFromCookie(cookieKey);
    if (!cartId) {
      // No saved cart id: consider cart as loaded with empty state
      setCartKey(null);
      setIsCartLoading(false);
      setIsCartLoaded(true);
      loadedRef.current = true;
      return;
    }

    isLoadingRef.current = true;
    setIsCartLoading(true);
    /* console.log("[CartProvider Shopana] Loading cart with ID:", cartId); */

    loadQuery({ checkoutId: cartId }, { fetchPolicy: "network-only" });
  }, [loadQuery, cookieKey]);

  const handleCartData = useCallback((cart: useCart_CartFragment$key) => {
    setCartKey(cart);
    setIsCartLoaded(true);
    isLoadingRef.current = false;
    setIsCartLoading(false);
    loadedRef.current = true;
  }, []);

  const handleCartNotFound = useCallback(() => {
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
      setId={(id) => {
        cartIdUtils.setCartIdCookie(id, cookieKey);
      }}
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
