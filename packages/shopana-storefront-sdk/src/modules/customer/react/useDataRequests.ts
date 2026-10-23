'use client';

import * as React from 'react';
import {
  SdkCustomerDataRequestCancelMutationDocument,
  SdkCustomerDataRequestCreateMutationDocument,
  SdkCustomerDataRequestsQueryDocument,
  type SdkCustomerDataRequestCancelMutation,
  type SdkCustomerDataRequestCreateMutation,
} from '../../../graphql/apollo/generated/operations';
import {
  DEFAULT_PAGE_SIZE,
  newIdempotencyKey,
  useCustomerConnectionQuery,
  useCustomerMutation,
  type CustomerMutationConfig,
} from './internal.js';
import type {
  CustomerConnectionOptions,
  CustomerConnectionState,
  CustomerDataRequest,
  CustomerDataRequestValues,
  CustomerMutation,
} from './types.js';

/** Privacy requests of the signed-in customer (access, export, correction, erasure). */
export function useDataRequests({
  first = DEFAULT_PAGE_SIZE,
}: CustomerConnectionOptions = {}): CustomerConnectionState<CustomerDataRequest> {
  const { state } = useCustomerConnectionQuery(
    SdkCustomerDataRequestsQueryDocument,
    { first },
    (value) => value.customer?.dataRequests
  );
  return state;
}

const createConfig: CustomerMutationConfig<
  SdkCustomerDataRequestCreateMutation,
  SdkCustomerDataRequestCreateMutation['customerDataRequestCreate'],
  CustomerDataRequest
> = {
  payload: (data) => data.customerDataRequestCreate,
  result: (payload) => payload.dataRequest,
  refetchQueries: [SdkCustomerDataRequestsQueryDocument],
};

/** Files a privacy request; resolves to the created request. */
export function useCreateDataRequest(): CustomerMutation<
  CustomerDataRequestValues,
  CustomerDataRequest
> {
  const [commit, loading] = useCustomerMutation(
    SdkCustomerDataRequestCreateMutationDocument,
    createConfig
  );
  const createDataRequest = React.useCallback(
    (values: CustomerDataRequestValues) =>
      commit({ input: { ...values, idempotencyKey: newIdempotencyKey() } }),
    [commit]
  );
  return [createDataRequest, loading] as const;
}

const cancelConfig: CustomerMutationConfig<
  SdkCustomerDataRequestCancelMutation,
  SdkCustomerDataRequestCancelMutation['customerDataRequestCancel'],
  CustomerDataRequest
> = {
  payload: (data) => data.customerDataRequestCancel,
  // The request is normalized: its new status replaces the cached one in the list.
  result: (payload) => payload.dataRequest,
};

/** Cancels a pending privacy request; resolves to the cancelled request. */
export function useCancelDataRequest(): CustomerMutation<
  string,
  CustomerDataRequest
> {
  const [commit, loading] = useCustomerMutation(
    SdkCustomerDataRequestCancelMutationDocument,
    cancelConfig
  );
  const cancelDataRequest = React.useCallback(
    (dataRequestId: string) =>
      commit({
        input: { dataRequestId, idempotencyKey: newIdempotencyKey() },
      }),
    [commit]
  );
  return [cancelDataRequest, loading] as const;
}
