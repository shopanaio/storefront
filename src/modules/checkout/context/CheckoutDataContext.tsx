'use client';

import React, { createContext, useContext } from 'react';
import type { Entity } from '@src/entity';

export interface CheckoutDataContextValue {
  cart: Entity.Cart | null;
}

const CheckoutDataContext = createContext<CheckoutDataContextValue | undefined>(
  undefined
);

export function CheckoutDataProvider({
  cart,
  children,
}: {
  cart: Entity.Cart | null;
  children: React.ReactNode;
}) {
  return (
    <CheckoutDataContext.Provider value={{ cart }}>
      {children}
    </CheckoutDataContext.Provider>
  );
}

export function useCheckoutData() {
  const ctx = useContext(CheckoutDataContext);
  if (!ctx) throw new Error('useCheckoutData must be used within CheckoutDataProvider');
  return ctx;
}
