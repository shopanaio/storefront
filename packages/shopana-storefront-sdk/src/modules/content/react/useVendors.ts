'use client';

import { useQuery } from '@apollo/client/react';
import {
  SdkVendorsDocument,
  type SdkVendorFragment,
} from '../../../graphql/apollo/generated/operations';

export type Vendor = SdkVendorFragment;

const EMPTY_VENDORS: readonly Vendor[] = [];

/**
 * The first vendors (brands) of the store that have published products, ordered by name in the
 * request language. `first` is between 1 and 100.
 */
export function useVendors(first: number) {
  const query = useQuery(SdkVendorsDocument, {
    variables: { first, after: null },
    fetchPolicy: 'cache-first',
  });
  const connection = query.data?.vendors;
  return {
    vendors: connection?.nodes ?? EMPTY_VENDORS,
    totalCount: connection?.totalCount ?? 0,
    hasNextPage: connection?.pageInfo.hasNextPage ?? false,
    loading: query.loading && !connection,
    error: query.error ?? null,
  };
}
