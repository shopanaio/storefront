'use client';

import React, { useCallback } from 'react';
import type { NormalizedCacheObject } from '@apollo/client';
import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs';
import { createApolloClient } from '../../graphql/apollo/Environment';
import type { ApolloEnvironmentConfig } from '../../graphql/apollo/types';

export interface ApolloAppProviderProps {
  children: React.ReactNode;
  environmentConfig: ApolloEnvironmentConfig;
  initialState?: NormalizedCacheObject;
}

/**
 * Client boundary for Apollo hooks, streaming SSR and RSC cache hydration.
 * It owns the single Apollo lifecycle used by browser-side SDK consumers.
 */
export function ApolloAppProvider({
  children,
  environmentConfig,
  initialState,
}: ApolloAppProviderProps) {
  const makeClient = useCallback(
    () => createApolloClient(environmentConfig, { initialState }),
    [environmentConfig, initialState]
  );

  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
