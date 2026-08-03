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
 * It is safe to render next to RelayEnvironmentProvider during migration.
 */
export function ApolloAppProvider({
  children,
  environmentConfig,
  initialState,
}: ApolloAppProviderProps) {
  const makeClient = useCallback(
    () => createApolloClient(environmentConfig, { initialState }),
    [
      environmentConfig.graphqlUrl,
      environmentConfig.apiKeyHeader,
      environmentConfig.apiKey,
      environmentConfig.accessTokenCookieName,
      initialState,
    ]
  );

  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
