'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { useQuery } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client';
import { CartContextProvider } from '../context/CartContext';
import type { CartStore } from '../../store/CartStore';
import type { CartConfig } from '../../core/config';
import { createCartConfig } from '../../core/config';
import { resolveCartLineId } from '../../core/utils/resolveCartLineId';
import {
  createCartMutationQueue,
  type MutationQueueOptions,
} from '../../core/utils/mutationQueue';
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

/**
 * Whether the server says the cart does not exist: no checkout for the id, or a `NOT_FOUND`
 * error. A network or any other error says nothing about the cart.
 */
function isCartMissing(data: SdkLoadCartQuery | undefined, error: unknown): boolean {
  if (error) {
    return (
      CombinedGraphQLErrors.is(error) &&
      error.errors.some((item) => item.extensions?.code === 'NOT_FOUND')
    );
  }
  return data !== undefined && !data.checkout;
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
  const confirmed = useRef({
    checkout: initialCheckout,
    cart: storeObject.cart,
  });
  const reconcileMutations = useCallback(
    (optimisticEdits: ReadonlyArray<() => void>) => {
      setCartKey(confirmed.current.checkout);
      storeObject.setCart(confirmed.current.cart);
      for (const edit of optimisticEdits) edit();
    },
    [storeObject]
  );
  // The queue stores this callback and invokes it after each mutation settles.
  // eslint-disable-next-line react-hooks/refs
  const [mutationQueue] = useState(() =>
    createCartMutationQueue(reconcileMutations)
  );
  const enqueueMutation = useCallback(
    <T,>(operation: () => Promise<T>, options?: MutationQueueOptions) =>
      mutationQueue.run(operation, options),
    [mutationQueue]
  );
  const waitForMutations = useCallback(() => mutationQueue.idle(), [mutationQueue]);
  const cartUpdateListeners = useRef(
    new Set<(checkout: SdkCartFragment_CartFragment | null) => void>()
  );
  const subscribeCartUpdates = useCallback(
    (listener: (checkout: SdkCartFragment_CartFragment | null) => void) => {
      cartUpdateListeners.current.add(listener);
      return () => {
        cartUpdateListeners.current.delete(listener);
      };
    },
    []
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
      if (mutationQueue.pending === 0) {
        const cart = mapShopanaCheckoutToEntityCart(checkout);
        confirmed.current = { checkout, cart };
        setCartKey(checkout);
        setCartId(checkout.id);
        storeObject.setCart(cart);
      }
    } else if (!shouldLoad && !storeObject.cart) {
      storeObject.setCart(null);
    } else if (!query.loading && shouldLoad && isCartMissing(query.data, query.error)) {
      // Only the server saying the cart does not exist drops it: a failed request keeps
      // the cart and its cookie, so a retry loads it again.
      cartIdUtils.removeCartIdCookie();
      confirmed.current = { checkout: null, cart: null };
      setCartId(null);
      setCartKey(null);
      storeObject.setCart(null);
    }
  }, [
    cartIdUtils,
    initialCheckout,
    query.data,
    query.error,
    query.loading,
    shouldLoad,
    storeObject,
    mutationQueue,
  ]);

  const handleSetCartKey = useCallback(
    (checkout: SdkCartFragment_CartFragment | null) => {
      const cart = checkout ? mapShopanaCheckoutToEntityCart(checkout) : null;
      confirmed.current = { checkout, cart };
      cartUpdateListeners.current.forEach((listener) => listener(checkout));
      if (mutationQueue.pending > 0) return;
      setCartKey(checkout);
      storeObject.setCart(cart);
    },
    [storeObject, mutationQueue]
  );

  const getConfirmedLineId = useCallback(
    (lineId: string, purchasableId: string | undefined) => {
      const id = resolveCartLineId(
        confirmed.current.cart,
        lineId,
        purchasableId
      );
      if (!id) throw new Error('Cart line is unavailable');
      return id;
    },
    []
  );

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
      setCartKey={handleSetCartKey}
      enqueueMutation={enqueueMutation}
      waitForMutations={waitForMutations}
      subscribeCartUpdates={subscribeCartUpdates}
      getConfirmedLineId={getConfirmedLineId}
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
