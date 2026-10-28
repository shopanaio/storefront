'use client';

import React, { useCallback } from 'react';
import type { NormalizedCacheObject } from '@apollo/client';
import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs';
import { createNextApolloClient } from './createNextApolloClient';
import type { ApolloEnvironmentConfig } from '../../graphql/apollo/types';

export interface ApolloAppProviderProps {
  children: React.ReactNode;
  environmentConfig: ApolloEnvironmentConfig;
  initialState?: NormalizedCacheObject;
  /** BCP 47 tag of the page locale, sent as `Accept-Language`. */
  locale: string;
}

/**
 * Client boundary for Apollo hooks, streaming SSR and RSC cache hydration.
 * It owns the single Apollo lifecycle used by browser-side SDK consumers.
 */
export function ApolloAppProvider({
  children,
  environmentConfig,
  initialState,
  locale,
}: ApolloAppProviderProps) {
  const makeClient = useCallback(
    () => createNextApolloClient(environmentConfig, { initialState, locale }),
    [environmentConfig, initialState, locale]
  );

  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
