'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import type { Checkout } from '@src/modules/checkout/types/entity';
import { mapApiCheckoutToCheckout } from '@src/modules/checkout/hooks/useCheckout/mapApiCheckoutToCheckout';
import { StorefrontLoadCheckoutQueryDocument } from '../../../../codegen/apollo/storefront-operations';
import type { StorefrontUseCheckoutFragment } from '../../../../codegen/apollo/storefront-operations';

export interface CheckoutDataContextValue {
  checkout: Checkout.Checkout | null;
  /** @deprecated Use `checkout` instead. */
  cart: Checkout.Checkout | null;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
}

interface CheckoutDataInternalContextValue {
  checkout: StorefrontUseCheckoutFragment | null;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
}

const CheckoutDataContext = createContext<
  CheckoutDataInternalContextValue | undefined
>(undefined);

export const CheckoutDataContextProvider: React.FC<{
  children: React.ReactNode;
  checkoutId: string | null;
}> = ({ children, checkoutId }) => {
  const query = useQuery(StorefrontLoadCheckoutQueryDocument, {
    variables: { checkoutId: checkoutId ?? '' },
    skip: !checkoutId,
    fetchPolicy: 'network-only',
  });
  const checkout = query.data?.checkout ?? null;

  return (
    <CheckoutDataContext.Provider
      value={{
        checkout,
        loading: query.loading,
        loaded: !query.loading,
        error: query.error ?? null,
      }}
    >
      {children}
    </CheckoutDataContext.Provider>
  );
};

export function useCheckoutData(): CheckoutDataContextValue {
  const context = useContext(CheckoutDataContext);
  if (!context) {
    throw new Error('useCheckoutData must be used within CheckoutDataProvider');
  }
  const checkout = useMemo(
    () =>
      context.checkout ? mapApiCheckoutToCheckout(context.checkout) : null,
    [context.checkout]
  );

  return {
    checkout,
    cart: checkout,
    loading: context.loading,
    loaded: context.loaded,
    error: context.error,
  };
}
