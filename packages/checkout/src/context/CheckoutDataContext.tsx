'use client';

import React, { createContext, useContext, useMemo } from 'react';
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
  /** Reads the checkout again, e.g. after the cart changed outside the checkout API. */
  refetch: () => Promise<unknown>;
}

const CheckoutDataContext = createContext<CheckoutDataContextValue | undefined>(
  undefined
);

export const CheckoutDataContextProvider: React.FC<{
  children: React.ReactNode;
  checkoutId: string | null;
}> = ({ children, checkoutId }) => {
  const query = useQuery(StorefrontLoadCheckoutQueryDocument, {
    variables: { checkoutId: checkoutId ?? '' },
    skip: !checkoutId,
    fetchPolicy: 'network-only',
  });
  const apiCheckout: StorefrontUseCheckoutFragment | null = query.data?.checkout ?? null;
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
      refetch: query.refetch,
    }),
    [checkout, query.loading, error, query.refetch]
  );

  return (
    <CheckoutDataContext.Provider value={value}>{children}</CheckoutDataContext.Provider>
  );
};

export function useCheckoutData(): CheckoutDataContextValue {
  const context = useContext(CheckoutDataContext);
  if (!context) {
    throw new Error('useCheckoutData must be used within CheckoutDataProvider');
  }
  return context;
}
