import type { OperationVariables, TypedDocumentNode } from '@apollo/client';
import { useSuspenseQuery } from '@apollo/client/react';

export type CompatibleFetchPolicy =
  | 'store-or-network'
  | 'store-and-network'
  | 'network-only'
  | 'store-only';

const policies = {
  'store-or-network': 'cache-first',
  'store-and-network': 'cache-and-network',
  'network-only': 'network-only',
  'store-only': 'cache-only',
} as const;

export function useLazyLoadQuery<TData, TVariables extends OperationVariables>(
  query: TypedDocumentNode<TData, TVariables>,
  variables: TVariables,
  options: {
    fetchPolicy?: CompatibleFetchPolicy;
    fetchKey?: string | number;
  } = {}
): TData {
  return useSuspenseQuery(query, {
    variables,
    fetchPolicy: policies[options.fetchPolicy ?? 'store-or-network'],
    queryKey: options.fetchKey,
  }).data as TData;
}
