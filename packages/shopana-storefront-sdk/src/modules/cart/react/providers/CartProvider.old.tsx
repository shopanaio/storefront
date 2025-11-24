'use client';

import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { PreloadedQuery, usePreloadedQuery, useQueryLoader } from 'react-relay';
// @ts-ignore - TODO: Phase 2 - Move CartContextProvider to SDK
import { CartContextProvider } from '@src/providers/cart-context';
// @ts-ignore - TODO: Phase 2 - Move useCart_CartFragment$key to SDK
import { useCart_CartFragment$key } from '@src/hooks/cart/useCartFragment/__generated__/useCart_CartFragment.graphql';
// @ts-ignore - TODO: Phase 2 - Move cartIdUtils to SDK
import cartIdUtils from '@src/utils/cartId';
// @ts-ignore - TODO: Phase 2 - Move loadCartQuery to SDK
import loadCartQuery from '@src/hooks/cart/loadCartQuery';
// @ts-ignore - TODO: Phase 2 - Move LoadCartQueryType to SDK
import { loadCartQuery as LoadCartQueryType } from '@src/hooks/cart/loadCartQuery/__generated__/loadCartQuery.graphql';
// @ts-ignore - TODO: Phase 2 - Move useCartFragment to SDK (local version)
import useCartFragment from '../hooks/useCartFragment';
// @ts-ignore - TODO: Phase 2 - Move useCartStore to SDK
import { useCartStore } from '@src/store/cartStore';

interface CartProviderProps {
  children: React.ReactNode;
  cookie: string;
}

type LoadCartQueryReference = PreloadedQuery<LoadCartQueryType>;

const CartDataStoreController = () => {
  const { cart } = useCartFragment();
  const { setCart } = useCartStore.getState();

  useEffect(() => {
    setCart(cart);
  }, [cart]);

  return null;
};

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
      console.log('Cart not found');
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
  const [cartId, setCartId] = useState<string | null>(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const isLoadingRef = useRef(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || isLoadingRef.current) return;

    const savedCartId = cartIdUtils.getCartIdFromCookie(cookieKey);
    if (!savedCartId) {
      // No saved cart id: consider cart as loaded with empty state
      setCartKey(null);
      setCartId(null);
      setIsCartLoading(false);
      setIsCartLoaded(true);
      loadedRef.current = true;
      return;
    }

    setCartId(savedCartId);
    isLoadingRef.current = true;
    setIsCartLoading(true);
    /* console.log("[CartProvider Shopana] Loading cart with ID:", savedCartId); */

    loadQuery({ checkoutId: savedCartId }, { fetchPolicy: 'network-only' });
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
    setCartId(null);
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
      setId={(id: string | null) => {
        setCartId(id);
        if (id) {
          cartIdUtils.setCartIdCookie(id, cookieKey);
        }
      }}
      cartId={cartId}
    >
      <Suspense fallback={null}>
        {queryReference ? (
          <CartDataHandler
            queryReference={queryReference}
            onCartData={handleCartData}
            onCartNotFound={handleCartNotFound}
          />
        ) : null}
      </Suspense>
      {children}
      <CartDataStoreController />
    </CartContextProvider>
  );
};

export default CartProvider;
