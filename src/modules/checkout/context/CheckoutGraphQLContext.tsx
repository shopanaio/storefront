'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useCheckoutApi, type CheckoutApi } from '@src/modules/checkout/api/CheckoutApi';
import { useCheckoutData } from '@src/modules/checkout/context/CheckoutDataContext';

interface CheckoutGraphQLContextValue extends CheckoutApi {
  checkoutId: string | null;
}

const CheckoutGraphQLContext = createContext<CheckoutGraphQLContextValue | null>(null);

export function CheckoutGraphQLProvider({ children }: { children: React.ReactNode }) {
  const api = useCheckoutApi();
  const { cart } = useCheckoutData();
  const checkoutId = cart?.id ?? null;

  const value = useMemo<CheckoutGraphQLContextValue>(() => ({
    checkoutId,
    ...api,
  }), [api, checkoutId]);

  return (
    <CheckoutGraphQLContext.Provider value={value}>
      {children}
    </CheckoutGraphQLContext.Provider>
  );
}

export function useCheckoutGraphQL() {
  const ctx = useContext(CheckoutGraphQLContext);
  if (!ctx) throw new Error('useCheckoutGraphQL must be used within CheckoutGraphQLProvider');
  return ctx;
}
