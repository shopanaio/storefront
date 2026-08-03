'use client';

import React, { createContext, useContext } from 'react';
import type { OperationVariables } from '@apollo/client';
import { useReadQuery } from '@apollo/client/react';
import type { TransportedQueryRef } from '@apollo/client-integration-nextjs';

const ApolloQueryContext = createContext<TransportedQueryRef<any, any> | null>(
  null
);

export interface ApolloQueryProviderProps<
  TData,
  TVariables extends OperationVariables,
> {
  children: React.ReactNode;
  queryRef: TransportedQueryRef<TData, TVariables>;
}

/**
 * Optional context wrapper matching the existing Relay QueryProvider pattern.
 * It avoids threading Apollo's transported queryRef through every UI layer.
 */
export function ApolloQueryProvider<
  TData,
  TVariables extends OperationVariables,
>({ children, queryRef }: ApolloQueryProviderProps<TData, TVariables>) {
  return (
    <ApolloQueryContext.Provider value={queryRef}>
      {children}
    </ApolloQueryContext.Provider>
  );
}

export function useApolloQueryRef<
  TData,
  TVariables extends OperationVariables = OperationVariables,
>(): TransportedQueryRef<TData, TVariables> {
  const queryRef = useContext(ApolloQueryContext);
  if (!queryRef) {
    throw new Error(
      'useApolloQueryRef must be used within ApolloQueryProvider'
    );
  }

  return queryRef as TransportedQueryRef<TData, TVariables>;
}

/** Reads the query preloaded by an RSC PreloadQuery component. */
export function useApolloPreloadedQuery<TData>() {
  return useReadQuery(useApolloQueryRef<TData>());
}
