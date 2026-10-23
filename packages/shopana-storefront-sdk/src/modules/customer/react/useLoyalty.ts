'use client';

import * as React from 'react';
import { useApolloClient } from '@apollo/client/react';
import {
  SdkLoyaltyAccountQueryDocument,
  SdkLoyaltyTransactionsQueryDocument,
} from '../../../graphql/apollo/generated/operations';
import {
  DEFAULT_PAGE_SIZE,
  useCustomerConnectionQuery,
  useCustomerQuery,
} from './internal.js';
import type {
  CustomerConnectionOptions,
  CustomerConnectionState,
  CustomerQueryState,
  LoyaltyAccount,
  LoyaltyTransaction,
} from './types.js';

export interface LoyaltyAccountState extends CustomerQueryState {
  /** `null` without a session, without an active program, or without an account. */
  account: LoyaltyAccount | null;
}

/**
 * Loyalty account of the signed-in customer in the active program of the store. It is read
 * apart from the checkout, so that a change of the checkout does not ask the loyalty service;
 * read it again (`refetch`, `useRefetchLoyaltyAccount`) when something it shows may have
 * changed: a reward used, an order placed.
 */
export function useLoyaltyAccount(): LoyaltyAccountState {
  const { data, state } = useCustomerQuery(SdkLoyaltyAccountQueryDocument, {
    nextFetchPolicy: 'cache-first',
  });
  const account: LoyaltyAccount | null = data?.customer?.loyaltyAccount ?? null;
  return { ...state, account };
}

/** Reads the loyalty account again from outside its readers (after a write or a placement). */
export function useRefetchLoyaltyAccount(): () => Promise<void> {
  const client = useApolloClient();
  return React.useCallback(async () => {
    await client
      .refetchQueries({ include: [SdkLoyaltyAccountQueryDocument] })
      .catch(() => undefined);
  }, [client]);
}

/** Points ledger of the signed-in customer, newest first, page by page. */
export function useLoyaltyTransactions({
  first = DEFAULT_PAGE_SIZE,
}: CustomerConnectionOptions = {}): CustomerConnectionState<LoyaltyTransaction> {
  const { state } = useCustomerConnectionQuery(
    SdkLoyaltyTransactionsQueryDocument,
    { first },
    (value) => value.customer?.loyaltyAccount?.transactions
  );
  return state;
}
