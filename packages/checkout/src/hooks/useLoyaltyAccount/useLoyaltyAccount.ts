import { useMemo } from 'react';
import { useLoyaltyAccount as useCustomerLoyaltyAccount } from '@shopana/storefront-sdk/modules/customer/react';
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
 * Loyalty account of the signed-in buyer, as the checkout shows it. The SDK reads it apart
 * from the checkout, so that a change of the checkout does not ask the loyalty service; the
 * checkout reads it again when something it shows may have changed (a reward used, an order
 * placed, a sign-in).
 */
export function useLoyaltyAccount(): LoyaltyAccountState {
  const {
    account: apiAccount,
    loading,
    error,
    refetch,
  } = useCustomerLoyaltyAccount();
  const account = useMemo(
    () => (apiAccount ? mapLoyaltyAccount(apiAccount) : null),
    [apiAccount]
  );
  return {
    account,
    loading,
    failed: Boolean(error),
    refetch: () => {
      void refetch();
    },
  };
}
