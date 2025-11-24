'use client';

import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { PreloadedQuery, usePreloadedQuery, useQueryLoader } from 'react-relay';
import { CartContextProvider } from '../context/CartContext';
import { CartStore } from '../../store';
import type { CartConfig } from '../../core/config';
import { createCartConfig } from '../../core/config';
import { createCartIdUtils } from '../../core/utils/cartId';
import { loadCartQuery } from '../../core/graphql/queries';
import type { loadCartQuery as LoadCartQueryType } from '../../core/graphql/queries/__generated__/loadCartQuery.graphql';
import type { useCart_CartFragment$key } from '../../core/graphql/fragments/__generated__/useCart_CartFragment.graphql';

export interface CartProviderProps {
  children: React.ReactNode;
  store: CartStore;
  config: CartConfig;
  /**
   * Optional initial cart data from server (SSR)
   */
  initialCartData?: PreloadedQuery<LoadCartQueryType> | null;
}

type LoadCartQueryReference = PreloadedQuery<LoadCartQueryType>;

/**
 * Internal component to sync cart fragment data to Zustand store
 */
const CartDataStoreController: React.FC<{
  cartKey: useCart_CartFragment$key | null;
  store: CartStore;
}> = ({ cartKey, store }) => {
  useEffect(() => {
    if (cartKey) {
      // Cart data is already in fragment form, set it to store
      // The fragment will be read by hooks using useFragment
      store.setCart(cartKey as any);
    }
  }, [cartKey, store]);

  return null;
};

/**
 * Internal component to handle cart query loading
 */
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
      console.log('[CartProvider] Cart not found');
      onCartNotFound();
    }
  }, [cartData, onCartData, onCartNotFound]);

  return null;
};

/**
 * Cart Provider Component
 *
 * Provides cart state management with automatic loading from cookies.
 * Works with both client-side and server-side rendering.
 *
 * @example
 * ```tsx
 * import { CartProvider, createCartStoreZustand } from '@shopana/storefront-sdk/modules/cart/react';
 *
 * const cartStore = createCartStoreZustand();
 *
 * function App() {
 *   return (
 *     <CartProvider
 *       store={cartStore}
 *       config={{
 *         defaultCurrency: 'USD',
 *         defaultLocale: 'en',
 *       }}
 *     >
 *       {children}
 *     </CartProvider>
 *   );
 * }
 * ```
 */
export const CartProvider: React.FC<CartProviderProps> = ({
  children,
  store,
  config: userConfig,
  initialCartData,
}) => {
  // Merge user config with defaults
  const config = createCartConfig(userConfig);

  // Create cart ID utils
  const cartIdUtils = createCartIdUtils({
    cookieName: config.cookieName,
    cookieOptions: config.cookieOptions,
  });

  const [queryReference, loadQuery, disposeQuery] =
    useQueryLoader<LoadCartQueryType>(loadCartQuery);
  const [cartKey, setCartKey] = useState<useCart_CartFragment$key | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const isLoadingRef = useRef(false);
  const loadedRef = useRef(false);

  // Load cart on mount
  useEffect(() => {
    if (loadedRef.current || isLoadingRef.current) return;

    // Try to get cart ID from cookies
    const savedCartId = cartIdUtils.getCartIdFromCookie();

    if (!savedCartId) {
      // No saved cart: consider cart as loaded with empty state
      setCartKey(null);
      setCartId(null);
      loadedRef.current = true;
      return;
    }

    setCartId(savedCartId);
    isLoadingRef.current = true;

    // Load cart data
    loadQuery({ checkoutId: savedCartId }, { fetchPolicy: 'network-only' });
  }, [loadQuery, cartIdUtils]);

  const handleCartData = useCallback((cart: useCart_CartFragment$key) => {
    setCartKey(cart);
    isLoadingRef.current = false;
    loadedRef.current = true;
  }, []);

  const handleCartNotFound = useCallback(() => {
    isLoadingRef.current = false;
    setCartKey(null);
    setCartId(null);
    loadedRef.current = true;
    // Remove invalid cart ID from cookies
    cartIdUtils.removeCartIdCookie();
  }, [cartIdUtils]);

  const handleSetCartId = useCallback(
    (id: string | null) => {
      setCartId(id);
      if (id) {
        cartIdUtils.setCartIdCookie(id);
      } else {
        cartIdUtils.removeCartIdCookie();
      }
    },
    [cartIdUtils]
  );

  useEffect(() => {
    return () => {
      if (disposeQuery) {
        disposeQuery();
      }
    };
  }, [disposeQuery]);

  return (
    <CartContextProvider store={store} config={config}>
      <Suspense fallback={null}>
        {queryReference && (
          <CartDataHandler
            queryReference={queryReference}
            onCartData={handleCartData}
            onCartNotFound={handleCartNotFound}
          />
        )}
        {initialCartData && (
          <CartDataHandler
            queryReference={initialCartData}
            onCartData={handleCartData}
            onCartNotFound={handleCartNotFound}
          />
        )}
      </Suspense>
      {children}
      <CartDataStoreController cartKey={cartKey} store={store} />
    </CartContextProvider>
  );
};

export default CartProvider;
