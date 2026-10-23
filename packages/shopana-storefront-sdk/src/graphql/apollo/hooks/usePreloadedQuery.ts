import type { OperationVariables, TypedDocumentNode } from '@apollo/client';
import { useReadQuery } from '@apollo/client/react';
import type { QueryRef } from '@apollo/client/react';

export function usePreloadedQuery<TData, TVariables extends OperationVariables>(
  _query: TypedDocumentNode<TData, TVariables>,
  queryRef: QueryRef<TData, TVariables>
): TData {
  return useReadQuery(queryRef).data;
}
