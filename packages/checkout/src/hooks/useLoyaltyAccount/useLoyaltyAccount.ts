import { useCallback, useMemo } from 'react';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { loyaltyAccountQuery } from '#checkout/api/queries/loyaltyAccountQuery.shopana';
import type { Checkout } from '#checkout/types/entity';
import { mapLoyaltyAccount } from './mapLoyaltyAccount';

export interface LoyaltyAccountState {
  /** `null` for a guest, without an active program, or without an account. */
  account: Checkout.LoyaltyAccount | null;
  loading: boolean;
  /** The account could not be read; the checkout goes on without it. */
  failed: boolean;
  refetch: () => void;
}

/**
 * Loyalty account of the buyer signed in to the checkout. It is read apart from the checkout,
 * so that a change of the checkout does not ask the loyalty service; the checkout reads it again
 * when something it shows may have changed (a reward used, an order placed, a sign-in).
 */
export function useLoyaltyAccount(): LoyaltyAccountState {
  const { checkout } = useCheckoutData();
  const customerId = checkout?.customerIdentity.customer?.id ?? null;
  const { data, loading, error, refetch } = useQuery(loyaltyAccountQuery, {
    skip: !customerId,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });
  const apiAccount = customerId ? data?.customer?.loyaltyAccount : null;
  const account = useMemo(
    () => (apiAccount ? mapLoyaltyAccount(apiAccount) : null),
    [apiAccount]
  );
  return {
    account,
    loading: Boolean(customerId) && loading && !data,
    failed: Boolean(customerId) && Boolean(error) && !data,
    refetch: () => {
      void refetch().catch(() => undefined);
    },
  };
}

/** Reads the loyalty account again from outside a component (after a write or a placement). */
export function useRefetchLoyaltyAccount(): () => void {
  const client = useApolloClient();
  return useCallback(() => {
    void client
      .refetchQueries({ include: [loyaltyAccountQuery] })
      .catch(() => undefined);
  }, [client]);
}
