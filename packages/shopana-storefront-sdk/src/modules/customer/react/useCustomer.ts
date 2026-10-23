'use client';

import * as React from 'react';
import {
  SdkCustomerMarketingConsentUpdateMutationDocument,
  SdkCustomerMarketingConsentsQueryDocument,
  SdkCustomerQueryDocument,
  SdkCustomerUpdateMutationDocument,
  type SdkCustomerMarketingConsentUpdateMutation,
  type SdkCustomerUpdateMutation,
} from '../../../graphql/apollo/generated/operations';
import {
  newIdempotencyKey,
  useCustomerMutation,
  useCustomerQuery,
  type CustomerMutationConfig,
} from './internal.js';
import type {
  CustomerMarketingConsent,
  CustomerMarketingConsentValues,
  CustomerMutation,
  CustomerProfile,
  CustomerProfileValues,
  CustomerQueryState,
} from './types.js';

export interface CustomerState extends CustomerQueryState {
  /** `null` without a session or before the first read. */
  customer: CustomerProfile | null;
}

/**
 * Profile of the signed-in customer. Email and phone are read-only here: identity belongs to
 * IAM, and `customerUpdate` does not change them.
 */
export function useCustomer(): CustomerState {
  const { data, state } = useCustomerQuery(SdkCustomerQueryDocument);
  const customer: CustomerProfile | null = data?.customer ?? null;
  return { ...state, customer };
}

type UpdatePayload = SdkCustomerUpdateMutation['customerUpdate'];

const updateCustomerConfig: CustomerMutationConfig<
  SdkCustomerUpdateMutation,
  UpdatePayload,
  CustomerProfile
> = {
  payload: (data) => data.customerUpdate,
  // The customer is normalized, so the answered profile updates every reader of the cache.
  result: (payload) => payload.customer,
};

/** Updates the profile; resolves to the updated profile. */
export function useUpdateCustomer(): CustomerMutation<
  CustomerProfileValues,
  CustomerProfile
> {
  const [commit, loading] = useCustomerMutation(
    SdkCustomerUpdateMutationDocument,
    updateCustomerConfig
  );
  const updateCustomer = React.useCallback(
    (values: CustomerProfileValues) =>
      commit({ input: { ...values, idempotencyKey: newIdempotencyKey() } }),
    [commit]
  );
  return [updateCustomer, loading] as const;
}

export interface MarketingConsentsState extends CustomerQueryState {
  /** Consents of every channel the customer has one for, in API order. */
  consents: readonly CustomerMarketingConsent[];
  emailAddress: CustomerProfile['emailAddress'] | null;
  phoneNumber: CustomerProfile['phoneNumber'] | null;
}

/** Marketing consents of the signed-in customer, with the contacts they apply to. */
export function useMarketingConsents(): MarketingConsentsState {
  const { data, state } = useCustomerQuery(
    SdkCustomerMarketingConsentsQueryDocument
  );
  const customer = data?.customer;
  return {
    ...state,
    consents: customer?.marketingConsents ?? [],
    emailAddress: customer?.emailAddress ?? null,
    phoneNumber: customer?.phoneNumber ?? null,
  };
}

type ConsentPayload =
  SdkCustomerMarketingConsentUpdateMutation['customerMarketingConsentUpdate'];

const updateMarketingConsentConfig: CustomerMutationConfig<
  SdkCustomerMarketingConsentUpdateMutation,
  ConsentPayload,
  CustomerMarketingConsent
> = {
  payload: (data) => data.customerMarketingConsentUpdate,
  // The payload answers the customer with the same contacts selection the readers use.
  result: (payload) => payload.marketingConsent,
};

/** Subscribes the customer to a channel or unsubscribes; resolves to the new consent. */
export function useUpdateMarketingConsent(): CustomerMutation<
  CustomerMarketingConsentValues,
  CustomerMarketingConsent
> {
  const [commit, loading] = useCustomerMutation(
    SdkCustomerMarketingConsentUpdateMutationDocument,
    updateMarketingConsentConfig
  );
  const updateMarketingConsent = React.useCallback(
    (values: CustomerMarketingConsentValues) =>
      commit({ input: { ...values, idempotencyKey: newIdempotencyKey() } }),
    [commit]
  );
  return [updateMarketingConsent, loading] as const;
}
