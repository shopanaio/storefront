'use client';

/**
 * CheckoutApiContext: provides checkoutId and CheckoutApi.
 */
import React, { createContext, useContext } from 'react';
import type { CheckoutApi } from '@src/modules/checkout/api/interface';
import { useCreateCheckoutApi } from '@src/modules/checkout/api/useCreateCheckoutApi';

export interface CheckoutApiContextValue {
  api: CheckoutApi;
}

const CheckoutApiContext = createContext<CheckoutApiContextValue | null>(null);

export function CheckoutApiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const api = useCreateCheckoutApi();

  return (
    <CheckoutApiContext.Provider value={{ api }}>
      {children}
    </CheckoutApiContext.Provider>
  );
}

export function useCheckoutApi(): CheckoutApi {
  const ctx = useContext(CheckoutApiContext);
  if (!ctx)
    throw new Error(
      'useCheckoutApiContext must be used within CheckoutApiProvider'
    );
  return ctx.api;
}
