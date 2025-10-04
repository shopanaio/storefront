'use client';

/**
 * CheckoutApiContext: provides checkoutId and a transport-agnostic CheckoutRepository.
 * Initially backed by GraphQL adapter; can be swapped without touching UI/controllers.
 */
import React, { createContext, useContext, useMemo } from 'react';
import { useCheckoutData } from '@src/modules/checkout/context/CheckoutDataContext';
import type { CheckoutRepository } from '@src/modules/checkout/core/contracts/CheckoutRepository';
import { useGraphQLCheckoutRepository } from '@src/modules/checkout/api/GraphQLCheckoutRepository';

export interface CheckoutApiContextValue {
  checkoutId: string | null;
  repository: CheckoutRepository;
}

const CheckoutApiContext = createContext<CheckoutApiContextValue | null>(null);

export function CheckoutApiProvider({ children }: { children: React.ReactNode }) {
  const { cart } = useCheckoutData();
  const checkoutId = cart?.id ?? null;
  const repository = useGraphQLCheckoutRepository();

  const value = useMemo<CheckoutApiContextValue>(() => ({
    checkoutId,
    repository,
  }), [checkoutId, repository]);

  return (
    <CheckoutApiContext.Provider value={value}>
      {children}
    </CheckoutApiContext.Provider>
  );
}

export function useCheckoutApiContext(): CheckoutApiContextValue {
  const ctx = useContext(CheckoutApiContext);
  if (!ctx) throw new Error('useCheckoutApiContext must be used within CheckoutApiProvider');
  return ctx;
}
