'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useCartSetters } from '@shopana/storefront-sdk/modules/cart/react/context/CartContext';
import { useQuery } from '@apollo/client/react';
import type { Checkout } from '#checkout/types/entity';
import { mapApiCheckoutToCheckout } from '#checkout/hooks/useCheckout/mapApiCheckoutToCheckout';
import { StorefrontLoadCheckoutQueryDocument } from '#checkout/graphql/operations';
import type { StorefrontUseCheckoutFragment } from '#checkout/graphql/operations';

export interface CheckoutDataContextValue {
  checkout: Checkout.Checkout | null;
  /** @deprecated Use `checkout` instead. */
  cart: Checkout.Checkout | null;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
  /**
   * Reads the checkout again, e.g. after the cart changed outside the checkout API. The read
   * waits in the queue of writes, so it never answers with a state older than a write queued
   * before it (SC-4i3a).
   */
  refetch: () => Promise<unknown>;
}

const CheckoutDataContext = createContext<CheckoutDataContextValue | undefined>(
  undefined
);

/** Whether `next` is a snapshot of the same checkout taken before `shown`. */
function isOlderSnapshot(
  next: StorefrontUseCheckoutFragment | null,
  shown: StorefrontUseCheckoutFragment | null
): boolean {
  return Boolean(
    next &&
    shown &&
    next.id === shown.id &&
    Date.parse(next.updatedAt) < Date.parse(shown.updatedAt)
  );
}

export const CheckoutDataContextProvider: React.FC<{
  children: React.ReactNode;
  checkoutId: string | null;
}> = ({ children, checkoutId }) => {
  const query = useQuery(StorefrontLoadCheckoutQueryDocument, {
    variables: { checkoutId: checkoutId ?? '' },
    skip: !checkoutId,
    fetchPolicy: 'network-only',
  });
  const received: StorefrontUseCheckoutFragment | null =
    query.data?.checkout ?? null;
  // An answer that left the checkout earlier than the one shown (a read sent before the last
  // write, or a write of another tab) does not replace it. Display only: nothing is sent.
  const [shown, setShown] = useState(received);
  const apiCheckout = isOlderSnapshot(received, shown) ? shown : received;
  if (apiCheckout !== shown) {
    setShown(apiCheckout);
  }

  // A cart change made outside the checkout (the cart drawer) changes the delivery groups and
  // the selections; they are read again right after it, in the queue of writes (BR-tpm1).
  const { enqueueMutation, subscribeCartUpdates } = useCartSetters();
  const { refetch: read } = query;
  const refetch = useCallback(
    () => enqueueMutation(() => read()),
    [enqueueMutation, read]
  );
  useEffect(
    () =>
      subscribeCartUpdates((cart) => {
        if (checkoutId && cart?.id === checkoutId) {
          void refetch().catch(() => undefined);
        }
      }),
    [checkoutId, refetch, subscribeCartUpdates]
  );
  // Mapped once for every consumer; the value changes only with the query state.
  const checkout = useMemo(
    () => (apiCheckout ? mapApiCheckoutToCheckout(apiCheckout) : null),
    [apiCheckout]
  );
  const error = query.error ?? null;
  const value = useMemo<CheckoutDataContextValue>(
    () => ({
      checkout,
      cart: checkout,
      loading: query.loading,
      loaded: !query.loading,
      error,
      refetch,
    }),
    [checkout, query.loading, error, refetch]
  );

  return (
    <CheckoutDataContext.Provider value={value}>
      {children}
    </CheckoutDataContext.Provider>
  );
};

export function useCheckoutData(): CheckoutDataContextValue {
  const context = useContext(CheckoutDataContext);
  if (!context) {
    throw new Error('useCheckoutData must be used within CheckoutDataProvider');
  }
  return context;
}
