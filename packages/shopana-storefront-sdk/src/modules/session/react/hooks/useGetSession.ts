'use client';

import { useLazyLoadQuery, usePreloadedQuery } from 'react-relay/hooks';
import { graphql } from 'relay-runtime';
import type { PreloadedQuery, GraphQLTaggedNode } from 'react-relay/hooks';

/**
 * GraphQL query for getting session data
 */
export const useGetSessionQuery: GraphQLTaggedNode = graphql`
  query useGetSessionQuery {
    session {
      user {
        id
        iid
        email
      }
      accessToken
    }
  }
`;

/**
 * Hook to get session data with lazy loading (client-side)
 *
 * @param fetchKey - Optional fetch key to force refetch
 * @returns Session query data
 *
 * @example
 * ```tsx
 * const sessionData = useGetSession();
 * const user = sessionData.session?.user;
 * ```
 */
export const useGetSession = (fetchKey: number = 0) => {
  return useLazyLoadQuery(
    useGetSessionQuery,
    {},
    {
      fetchPolicy: 'network-only',
      networkCacheConfig: {
        force: true,
      },
      fetchKey,
    }
  );
};

/**
 * Hook to use preloaded session query (for SSR)
 *
 * @param preloadedQuery - Preloaded query from server
 * @returns Session query data
 *
 * @example
 * ```tsx
 * const sessionData = useGetSessionPreloaded(preloadedQuery);
 * ```
 */
export const useGetSessionPreloaded = (
  preloadedQuery: PreloadedQuery<any>
) => {
  return usePreloadedQuery(useGetSessionQuery, preloadedQuery);
};

export default {
  useGetSession,
  useGetSessionPreloaded,
};
