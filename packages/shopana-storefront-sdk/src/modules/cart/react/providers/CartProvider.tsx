'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { CartContextProvider } from '../context/CartContext';
import type { CartStore } from '../../store/CartStore';
import type { CartConfig } from '../../core/config';
import { createCartConfig } from '../../core/config';
import { createCartIdUtils } from '../../core/utils/cartId';
import type { CartStoreZustand } from '../store/CartStoreZustand';
import { mapShopanaCheckoutToEntityCart } from '../../core/mappers/mapShopanaToEntityCart';
import {
  SdkLoadCartQueryDocument,
  type SdkCartFragment_CartFragment,
  type SdkLoadCartQuery,
  type SdkLoadCartQueryVariables,
} from '../../../../graphql/apollo/generated/operations';
import type { SerializableApolloQuery } from '../../../../graphql/apollo/loadSerializableQuery';

export interface CartProviderProps {
  children: React.ReactNode;
  store: CartStoreZustand | CartStore;
  config: CartConfig;
  initialCart?: SdkCartFragment_CartFragment | null;
  /** @deprecated Prefer initialCart or hydration through Apollo cache. */
  initialCartData?: SerializableApolloQuery<
    SdkLoadCartQuery,
    SdkLoadCartQueryVariables
  > | null;
}

function isCartStoreZustand(
  store: CartStoreZustand | CartStore
): store is CartStoreZustand {
  return 'store' in store && 'useStore' in store;
}

export const CartProvider: React.FC<CartProviderProps> = ({
  children,
  store: storeProp,
  config: userConfig,
  initialCart,
  initialCartData,
}) => {
  const { storeObject, useStoreHook } = useMemo(() => {
    if (isCartStoreZustand(storeProp)) {
      return { storeObject: storeProp.store, useStoreHook: storeProp.useStore };
    }
    const unsupportedUseStore = (() => {
      throw new Error(
        'Selector-based cart access requires createCartStoreZustand().'
      );
    }) as unknown as CartStoreZustand['useStore'];
    return { storeObject: storeProp, useStoreHook: unsupportedUseStore };
  }, [storeProp]);

  const config = useMemo(() => createCartConfig(userConfig), [userConfig]);
  const cartIdUtils = useMemo(
    () =>
      createCartIdUtils({
        cookieName: config.cookieName,
        cookieOptions: config.cookieOptions,
      }),
    [config.cookieName, config.cookieOptions]
  );
  const initialCheckout = initialCart ?? initialCartData?.data.checkout ?? null;
  const [cartKey, setCartKey] = useState<SdkCartFragment_CartFragment | null>(
    initialCheckout
  );
  const [cartId, setCartId] = useState<string | null>(
    initialCheckout?.id ?? null
  );
  const cookieCartId = cartId ?? cartIdUtils.getCartIdFromCookie();
  const shouldLoad =
    !initialCheckout && !storeObject.cart && Boolean(cookieCartId);
  const query = useQuery(SdkLoadCartQueryDocument, {
    variables: { checkoutId: cookieCartId ?? '' },
    skip: !shouldLoad,
  });

  useEffect(() => {
    const checkout = query.data?.checkout ?? initialCheckout;
    if (checkout) {
      // Keep the public mutable cart-key contract synchronized with Apollo results.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCartKey(checkout);
      setCartId(checkout.id);
      storeObject.setCart(mapShopanaCheckoutToEntityCart(checkout));
    } else if (!shouldLoad && !storeObject.cart) {
      storeObject.setCart(null);
    } else if (!query.loading && shouldLoad && !query.data?.checkout) {
      cartIdUtils.removeCartIdCookie();
      setCartId(null);
      setCartKey(null);
      storeObject.setCart(null);
    }
  }, [
    cartIdUtils,
    initialCheckout,
    query.data,
    query.loading,
    shouldLoad,
    storeObject,
  ]);

  const handleSetCartId = useCallback(
    (id: string | null) => {
      setCartId(id);
      if (id) cartIdUtils.setCartIdCookie(id);
      else cartIdUtils.removeCartIdCookie();
    },
    [cartIdUtils]
  );

  return (
    <CartContextProvider
      store={storeObject}
      useStore={useStoreHook}
      config={config}
      cartKey={cartKey}
      setCartKey={setCartKey}
      cartId={cartId}
      setId={handleSetCartId}
      isCartLoading={query.loading}
      isCartLoaded={!query.loading}
    >
      {children}
    </CartContextProvider>
  );
};

export default CartProvider;
