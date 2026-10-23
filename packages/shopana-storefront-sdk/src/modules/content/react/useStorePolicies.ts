'use client';

import { useQuery } from '@apollo/client/react';
import {
  SdkStorePolicyByHandleDocument,
  type SdkStoreFragment,
  type SdkStorePolicyDetailFragment,
} from '../../../graphql/apollo/generated/operations';
import { useStore } from '../../store/react/useStore';

export type StorePolicyLink = SdkStoreFragment['policies'][number];
export type StorePolicyType = StorePolicyLink['type'];
export type StorePolicy = SdkStorePolicyDetailFragment;

/** Published policies of the store in `StorePolicyType` order, without bodies. */
export function useStorePolicies(): readonly StorePolicyLink[] {
  return useStore().policies;
}

/** The published policy of a type, if the store has one. */
export function useStorePolicyLink(
  type: StorePolicyType
): StorePolicyLink | null {
  return useStore().policies.find((policy) => policy.type === type) ?? null;
}

/**
 * The latest published version of a policy with its body; `null` while loading, when it is not
 * published and when no handle is given. The API sanitizes `body.html`.
 */
export function useStorePolicy(handle: string | null | undefined) {
  const query = useQuery(SdkStorePolicyByHandleDocument, {
    variables: { handle: handle ?? '' },
    skip: !handle,
    fetchPolicy: 'cache-first',
  });
  const policy = query.data?.storePolicy ?? null;
  return {
    policy: policy && policy.handle === handle ? policy : null,
    loading: query.loading,
    error: query.error,
  };
}
