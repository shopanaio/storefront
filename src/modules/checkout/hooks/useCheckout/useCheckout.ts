import { useLazyLoadQuery } from 'react-relay';
import React, { useEffect, useMemo } from 'react';
import { loadCheckoutQuery } from '@src/modules/checkout/api/queries/loadCheckoutQuery.shopana';
import type { loadCheckoutQuery as LoadCheckoutQueryType } from '@src/modules/checkout/api/queries/__generated__/loadCheckoutQuery.graphql';
import { mapApiCheckoutToCheckout } from '@src/modules/checkout/mappers/mapApiCheckoutToCheckout';
import type { Checkout } from '@src/modules/checkout/types/entity';

/**
 * Hook to load and manage checkout data.
 * Fetches checkout data from the API and maps it to domain Checkout entity.
 *
 * @param cartId - The ID of the cart/checkout to load
 * @returns Checkout data, loading state, and error state
 */
const useCheckout = (cartId: string | null) => {
  // Client-side lazy query load
  const data = useLazyLoadQuery<LoadCheckoutQueryType>(
    loadCheckoutQuery,
    { checkoutId: cartId! },
    {
      fetchPolicy: 'network-only',
      networkCacheConfig: { force: true },
    }
  );

  // Extract checkout data from query result
  const apiCheckout = data.checkoutQuery?.checkout;

  // Map API checkout data to domain Checkout entity
  const checkout = useMemo<Checkout.Checkout | null>(() => {
    if (!apiCheckout) return null;
    return mapApiCheckoutToCheckout(apiCheckout);
  }, [apiCheckout]);

  // Log checkout information
  React.useEffect(() => {
    console.log('Shopana checkout active');
  }, []);

  return {
    checkout,
    loading: !data,
    loaded: !!data,
    error: null,
  };
};

export default useCheckout;
