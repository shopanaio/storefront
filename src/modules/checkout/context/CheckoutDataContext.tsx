'use client';

import React, { createContext, useContext } from 'react';
import type { Checkout } from '@src/modules/checkout/types/entity';
import useCheckout from '@src/modules/checkout/hooks/useCheckout/useCheckout';

export interface CheckoutDataContextValue {
  checkout: Checkout.Checkout | null;
  loading: boolean;
  loaded: boolean;
}

const CheckoutDataContext = createContext<CheckoutDataContextValue | undefined>(
  undefined
);

/**
 * Provider component that manages checkout data using useCheckout hook.
 * Provides checkout data to child components via context.
 *
 * @param cartId - The ID of the cart/checkout to load
 * @param children - Child components that will have access to checkout data
 */
export function CheckoutDataProvider({
  cartId,
  children,
}: {
  cartId: string | null;
  children: React.ReactNode;
}) {
  // Use the useCheckout hook to load and manage checkout data
  const { checkout, loading, loaded } = useCheckout(cartId);

  console.log('checkout', { checkout, loading, loaded });

  return (
    <CheckoutDataContext.Provider value={{ checkout, loading, loaded }}>
      {children}
    </CheckoutDataContext.Provider>
  );
}

/**
 * Hook to access checkout data from CheckoutDataContext
 *
 * @returns Checkout data, loading state, and loaded state
 */
export function useCheckoutData() {
  const ctx = useContext(CheckoutDataContext);
  if (!ctx)
    throw new Error('useCheckoutData must be used within CheckoutDataProvider');
  return ctx;
}
