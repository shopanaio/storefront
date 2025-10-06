'use client';

import React, { createContext, useContext } from 'react';
import type { Entity } from '@src/entity';

export interface CheckoutDataContextValue {
  checkout: Entity.Checkout | null;
}

const CheckoutDataContext = createContext<CheckoutDataContextValue | undefined>(
  undefined
);

export function CheckoutDataProvider({
  checkout,
  children,
}: {
  checkout: Entity.Checkout | null;
  children: React.ReactNode;
}) {
  return (
    <CheckoutDataContext.Provider value={{ checkout }}>
      {children}
    </CheckoutDataContext.Provider>
  );
}

export function useCheckoutData() {
  const ctx = useContext(CheckoutDataContext);
  if (!ctx) throw new Error('useCheckoutData must be used within CheckoutDataProvider');
  return ctx;
}
