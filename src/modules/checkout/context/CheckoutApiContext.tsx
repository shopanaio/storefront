'use client';

/**
 * CheckoutApiContext: provides checkoutId and CheckoutApi.
 */
import React, { createContext, useContext, useMemo } from 'react';
import { useCheckoutData } from '@src/modules/checkout/context/CheckoutDataContext';
import type { CheckoutApi } from '@src/modules/checkout/api/interface';
import { useCreateCheckoutApi } from '@src/modules/checkout/api/useCreateCheckoutApi';

export interface CheckoutApiContextValue {
  checkoutId: string | null;
  api: CheckoutApi;
}

const CheckoutApiContext = createContext<CheckoutApiContextValue | null>(null);

export function CheckoutApiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { checkout } = useCheckoutData();
  const checkoutId = checkout?.id ?? null;
  const api = useCreateCheckoutApi();

  const value = useMemo<CheckoutApiContextValue>(
    () => ({
      checkoutId,
      api,
    }),
    [checkoutId, api]
  );

  return (
    <CheckoutApiContext.Provider value={value}>
      {children}
    </CheckoutApiContext.Provider>
  );
}

export function useCheckoutApi(): CheckoutApiContextValue {
  const ctx = useContext(CheckoutApiContext);
  if (!ctx)
    throw new Error(
      'useCheckoutApiContext must be used within CheckoutApiProvider'
    );
  return ctx;
}
