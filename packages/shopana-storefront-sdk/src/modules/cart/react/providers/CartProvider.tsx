'use client';

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PreloadedQuery, readInlineData, useFragment, usePreloadedQuery, useQueryLoader } from 'react-relay';
import { CartContextProvider } from '../context/CartContext';
import { CartStore } from '../../store';
import type { CartConfig } from '../../core/config';
import { createCartConfig } from '../../core/config';
import { createCartIdUtils } from '../../core/utils/cartId';
import { loadCartQuery } from '../../core/graphql/queries';
import type { loadCartQuery as LoadCartQueryType } from '../../core/graphql/queries/__generated__/loadCartQuery.graphql';
import type { CartFragment_cart$key } from '../../core/graphql/fragments/__generated__/CartFragment_cart.graphql';
import { CartFragment_cart } from '../../core/graphql/fragments/CartFragment';
import { CartLineFragment_line } from '../hooks/useCartLineFragment';
import type { CartStoreZustand } from '../store/CartStoreZustand';

export interface CartProviderProps {
  children: React.ReactNode;
  /**
   * Cart store - can be either:
   * - CartStoreZustand object from createCartStoreZustand() (recommended)
   * - CartStore object (legacy)
   */
  store: CartStoreZustand | CartStore;
  config: CartConfig;
  /**
   * Optional initial cart data from server (SSR)
   */
  initialCartData?: PreloadedQuery<LoadCartQueryType> | null;
}

type LoadCartQueryReference = PreloadedQuery<LoadCartQueryType>;

/**
 * Check if store is CartStoreZustand (new format) or CartStore (legacy)
 */
function isCartStoreZustand(store: any): store is CartStoreZustand {
  return store && typeof store === 'object' && 'store' in store && 'useStore' in store;
}

/**
 * Internal component to sync cart fragment data to Zustand store
 * Reads Relay fragment and denormalizes data before storing in Zustand
 */
const CartDataStoreController: React.FC<{
  cartKey: CartFragment_cart$key | null;
  store: CartStore;
}> = ({ cartKey, store }) => {
  // Read fragment data from Relay
  const cart = useFragment<CartFragment_cart$key>(
    CartFragment_cart,
    cartKey
  );

  // Denormalize cart data (read inline data for lines)
  const cartData = useMemo(() => {
    if (!cart) {
      return null;
    }
    return {
      ...cart,
      lines: (cart?.lines || [])?.map((cartLineRef: any) =>
        readInlineData(CartLineFragment_line, cartLineRef)
      ),
    };
  }, [cart]);

  // Sync denormalized data to Zustand store
  useEffect(() => {
    if (cartData) {
      store.setCart(cartData as any);
    } else if (cartKey === null) {
      // Explicitly set null when cart is cleared
      store.setCart(null);
    }
  }, [cartData, cartKey, store]);

  return null;
};

/**
 * Internal component to handle cart query loading
 */
const CartDataHandler: React.FC<{
  queryReference: LoadCartQueryReference;
  onCartData: (cart: CartFragment_cart$key) => void;
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
  store: storeProp,
  config: userConfig,
  initialCartData,
}) => {
  // Extract store and useStore from prop
  const { storeObject, useStoreHook } = useMemo(() => {
    if (isCartStoreZustand(storeProp)) {
      // New format: { store, useStore }
      return {
        storeObject: storeProp.store,
        useStoreHook: storeProp.useStore,
      };
    } else {
      // Legacy format: just CartStore object
      // Create a dummy useStore that throws error if used
      const dummyUseStore = (() => {
        throw new Error(
          'useCartStore with selectors requires CartStoreZustand. ' +
          'Please update your code to use createCartStoreZustand() and pass the result to CartProvider.'
        );
      }) as any;
      return {
        storeObject: storeProp,
        useStoreHook: dummyUseStore,
      };
    }
  }, [storeProp]);

  // Merge user config with defaults
  const config = createCartConfig(userConfig);

  // Create cart ID utils
  const cartIdUtils = createCartIdUtils({
    cookieName: config.cookieName,
    cookieOptions: config.cookieOptions,
  });

  const [queryReference, loadQuery, disposeQuery] =
    useQueryLoader<LoadCartQueryType>(loadCartQuery);
  const [cartKey, setCartKey] = useState<CartFragment_cart$key | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
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
      setIsCartLoading(false);
      setIsCartLoaded(true);
      loadedRef.current = true;
      return;
    }

    setCartId(savedCartId);
    isLoadingRef.current = true;
    setIsCartLoading(true);

    // Load cart data
    loadQuery({ checkoutId: savedCartId }, { fetchPolicy: 'network-only' });
  }, [loadQuery, cartIdUtils]);

  const handleCartData = useCallback((cart: CartFragment_cart$key) => {
    setCartKey(cart);
    setIsCartLoading(false);
    setIsCartLoaded(true);
    isLoadingRef.current = false;
    loadedRef.current = true;
  }, []);

  const handleCartNotFound = useCallback(() => {
    isLoadingRef.current = false;
    setIsCartLoading(false);
    setCartKey(null);
    setCartId(null);
    setIsCartLoaded(true);
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
    <CartContextProvider
      store={storeObject}
      useStore={useStoreHook}
      config={config}
      cartKey={cartKey}
      setCartKey={setCartKey}
      cartId={cartId}
      setId={handleSetCartId}
      isCartLoading={isCartLoading}
      isCartLoaded={isCartLoaded}
    >
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
      <CartDataStoreController cartKey={cartKey} store={storeObject} />
    </CartContextProvider>
  );
};

export default CartProvider;
