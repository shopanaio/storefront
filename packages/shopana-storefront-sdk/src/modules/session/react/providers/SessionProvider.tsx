'use client';

import React from 'react';
import type { SerializablePreloadedQuery } from '../../../../graphql/relay/loadSerializableQuery';
import type { loadSessionQuery as LoadSessionQueryType } from '../../core/graphql/queries/__generated__/loadSessionQuery.graphql';
import { QueryProvider } from '../../../../next/relay/QueryProvider';
import { ConcreteRequest } from 'relay-runtime';

export interface SessionProviderProps {
  children: React.ReactNode;
  /**
   * Optional initial session data from server (SSR)
   */
  preloadedSessionQuery?: SerializablePreloadedQuery<
    ConcreteRequest,
    LoadSessionQueryType
  > | null;
}

/**
 * Session Provider Component
 *
 * Provides session state management with automatic loading from cookies.
 * Works with both client-side and server-side rendering.
 *
 * @example
 * ```tsx
 * import { SessionProvider } from '@shopana/storefront-sdk/modules/session/react';
 *
 * function App() {
 *   return (
 *     <SessionProvider preloadedSessionQuery={preloadedSessionQuery}>
 *       {children}
 *     </SessionProvider>
 *   );
 * }
 * ```
 */
export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
  preloadedSessionQuery,
}) => {
  if (!preloadedSessionQuery) {
    // No session data - user not logged in
    return <>{children}</>;
  }

  return (
    <QueryProvider preloadedQuery={preloadedSessionQuery}>
      {children}
    </QueryProvider>
  );
};

export default SessionProvider;
