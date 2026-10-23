'use client';

import * as React from 'react';
import {
  SdkCustomerAddressCreateMutationDocument,
  SdkCustomerAddressDefaultSetMutationDocument,
  SdkCustomerAddressDeleteMutationDocument,
  SdkCustomerAddressesQueryDocument,
  SdkCustomerAddressUpdateMutationDocument,
  type SdkCustomerAddressCreateMutation,
  type SdkCustomerAddressDefaultSetMutation,
  type SdkCustomerAddressDefaultsFragment,
  type SdkCustomerAddressDeleteMutation,
  type SdkCustomerAddressUpdateMutation,
} from '../../../graphql/apollo/generated/operations';
import {
  DEFAULT_PAGE_SIZE,
  newIdempotencyKey,
  useCustomerConnectionQuery,
  useCustomerMutation,
  type CustomerMutationConfig,
} from './internal.js';
import type {
  CustomerAddress,
  CustomerAddressCreateValues,
  CustomerAddressDefaults,
  CustomerAddressDefaultValues,
  CustomerAddressUpdateValues,
  CustomerConnectionOptions,
  CustomerConnectionState,
  CustomerMutation,
} from './types.js';

export interface CustomerAddressesState
  extends CustomerConnectionState<CustomerAddress>, CustomerAddressDefaults {}

function toDefaults(
  customer: SdkCustomerAddressDefaultsFragment | null | undefined
): CustomerAddressDefaults {
  return {
    defaultShippingAddressId: customer?.defaultShippingAddress?.id ?? null,
    defaultBillingAddressId: customer?.defaultBillingAddress?.id ?? null,
  };
}

/** Postal addresses of the signed-in customer, page by page. */
export function useCustomerAddresses({
  first = DEFAULT_PAGE_SIZE,
}: CustomerConnectionOptions = {}): CustomerAddressesState {
  const { data, state } = useCustomerConnectionQuery(
    SdkCustomerAddressesQueryDocument,
    { first },
    (value) => value.customer?.addresses
  );
  return { ...state, ...toDefaults(data?.customer) };
}

// Creating, deleting and changing defaults change the list and the default flags of other
// addresses, so the list is read again.
const refetchQueries = [SdkCustomerAddressesQueryDocument];

const createConfig: CustomerMutationConfig<
  SdkCustomerAddressCreateMutation,
  SdkCustomerAddressCreateMutation['customerAddressCreate'],
  CustomerAddress
> = {
  payload: (data) => data.customerAddressCreate,
  result: (payload) => payload.customerAddress,
  refetchQueries,
};

/** Adds an address; resolves to the created address. */
export function useCreateCustomerAddress(): CustomerMutation<
  CustomerAddressCreateValues,
  CustomerAddress
> {
  const [commit, loading] = useCustomerMutation(
    SdkCustomerAddressCreateMutationDocument,
    createConfig
  );
  const createAddress = React.useCallback(
    (values: CustomerAddressCreateValues) =>
      commit({ input: { ...values, idempotencyKey: newIdempotencyKey() } }),
    [commit]
  );
  return [createAddress, loading] as const;
}

const updateConfig: CustomerMutationConfig<
  SdkCustomerAddressUpdateMutation,
  SdkCustomerAddressUpdateMutation['customerAddressUpdate'],
  CustomerAddress
> = {
  payload: (data) => data.customerAddressUpdate,
  result: (payload) => payload.customerAddress,
  refetchQueries,
};

/** Replaces the fields of an address; resolves to the updated address. */
export function useUpdateCustomerAddress(): CustomerMutation<
  CustomerAddressUpdateValues,
  CustomerAddress
> {
  const [commit, loading] = useCustomerMutation(
    SdkCustomerAddressUpdateMutationDocument,
    updateConfig
  );
  const updateAddress = React.useCallback(
    (values: CustomerAddressUpdateValues) =>
      commit({ input: { ...values, idempotencyKey: newIdempotencyKey() } }),
    [commit]
  );
  return [updateAddress, loading] as const;
}

const deleteConfig: CustomerMutationConfig<
  SdkCustomerAddressDeleteMutation,
  SdkCustomerAddressDeleteMutation['customerAddressDelete'],
  string
> = {
  payload: (data) => data.customerAddressDelete,
  result: (payload) => payload.deletedAddressId,
  refetchQueries,
};

/** Deletes an address; resolves to the deleted address id. */
export function useDeleteCustomerAddress(): CustomerMutation<string, string> {
  const [commit, loading] = useCustomerMutation(
    SdkCustomerAddressDeleteMutationDocument,
    deleteConfig
  );
  const deleteAddress = React.useCallback(
    (addressId: string) =>
      commit({ input: { addressId, idempotencyKey: newIdempotencyKey() } }),
    [commit]
  );
  return [deleteAddress, loading] as const;
}

const defaultSetConfig: CustomerMutationConfig<
  SdkCustomerAddressDefaultSetMutation,
  SdkCustomerAddressDefaultSetMutation['customerAddressDefaultSet'],
  CustomerAddressDefaults
> = {
  payload: (data) => data.customerAddressDefaultSet,
  result: (payload) => (payload.customer ? toDefaults(payload.customer) : null),
  refetchQueries,
};

/**
 * Makes an address the default for the given kinds; `addressId: null` clears those defaults.
 * Resolves to the defaults after the change.
 */
export function useSetDefaultCustomerAddress(): CustomerMutation<
  CustomerAddressDefaultValues,
  CustomerAddressDefaults
> {
  const [commit, loading] = useCustomerMutation(
    SdkCustomerAddressDefaultSetMutationDocument,
    defaultSetConfig
  );
  const setDefaultAddress = React.useCallback(
    (values: CustomerAddressDefaultValues) =>
      commit({ input: { ...values, idempotencyKey: newIdempotencyKey() } }),
    [commit]
  );
  return [setDefaultAddress, loading] as const;
}
