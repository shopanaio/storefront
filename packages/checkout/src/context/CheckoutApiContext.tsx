'use client';

/**
 * CheckoutApiContext: provides checkoutId and CheckoutApi.
 */
import type { CheckoutApi } from '#checkout/api/interface';
import { useCreateCheckoutApi } from '#checkout/api/useCreateCheckoutApi';
import React, { createContext, useContext } from 'react';

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
