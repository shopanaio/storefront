'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { usePreloadedQuery, readInlineData } from 'react-relay';
import type { Checkout } from '@src/modules/checkout/types/entity';
import { useLoadCheckout } from '@src/modules/checkout/hooks/useLoadCheckout';
import { loadCheckoutQuery } from '@src/modules/checkout/api/queries/loadCheckoutQuery.shopana';
import type { loadCheckoutQuery as LoadCheckoutQueryType } from '@src/modules/checkout/api/queries/__generated__/loadCheckoutQuery.graphql';
import { useCartLineFragment_CartLineFragment } from '@src/hooks/cart/useCartLineFragment/useCartLineFragment.shopana';

export interface CheckoutDataContextValue {
  checkout: Checkout.Checkout | null;
  loading: boolean;
  loaded: boolean;
}

const CheckoutDataContext = createContext<CheckoutDataContextValue | undefined>(
  undefined
);

/**
 * Provider component that loads and manages checkout data.
 * Uses loadCheckoutQuery to fetch checkout data by cartId.
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
  // Load checkout query reference
  const { queryReference } = useLoadCheckout({ checkoutId: cartId });

  // Load checkout data using the query reference
  const data = usePreloadedQuery<LoadCheckoutQueryType>(loadCheckoutQuery, queryReference!);

  // Extract checkout data from query result
  // For Shopana: checkoutQuery.checkout
  // For Shopify: cart
  const checkoutData = (data as any).checkoutQuery?.checkout || (data as any).cart;

  // Map checkout data to Checkout format
  const checkout = useMemo<Checkout.Checkout | null>(() => {
    if (!checkoutData) return null;

    return {
      ...checkoutData,
      lines: (checkoutData?.lines || [])?.map((cartLineRef: any) =>
        readInlineData(useCartLineFragment_CartLineFragment, cartLineRef)
      ),
    } as Checkout.Checkout;
  }, [checkoutData]);

  const value = useMemo<CheckoutDataContextValue>(() => ({
    checkout,
    loading: !data,
    loaded: !!data,
  }), [checkout, data]);

  return (
    <CheckoutDataContext.Provider value={value}>
      {children}
    </CheckoutDataContext.Provider>
  );
}

export function useCheckoutData() {
  const ctx = useContext(CheckoutDataContext);
  if (!ctx) throw new Error('useCheckoutData must be used within CheckoutDataProvider');
  return ctx;
}
