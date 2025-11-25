'use client';

import type { SerializablePreloadedQuery } from '../../../../graphql/relay/loadSerializableQuery';
import { ConcreteRequest, OperationType } from 'relay-runtime';
import type { Session } from '../../core/types';

/**
 * Interface for session data returned from query
 */
export interface SessionData {
  user: any;
  token: string | null;
  expiresAt?: string | null;
}

/**
 * Interface for input props
 */
export interface UseGetSessionDataProps {
  preloadedSessionQuery?: SerializablePreloadedQuery<
    ConcreteRequest,
    OperationType
  >;
}

/**
 * Hook to extract session data from preloaded query
 * Works with both Shopana and Shopify response structures
 *
 * @param props - Input props with preloaded query
 * @returns Session data or null
 *
 * @example
 * ```tsx
 * const sessionData = useGetSessionData({ preloadedSessionQuery });
 * ```
 */
export const useGetSessionData = (
  props: UseGetSessionDataProps
): SessionData | null => {
  const { preloadedSessionQuery } = props;

  if (!preloadedSessionQuery?.response) {
    return null;
  }

  const response = preloadedSessionQuery.response;

  // Handle Shopana response structure
  if (response && typeof response === 'object' && 'data' in response) {
    const data = (response as any).data;
    if (data?.session) {
      return {
        user: data.session.user,
        token: data.session.accessToken,
        expiresAt: data.session.expiresAt,
      };
    }
  }

  return null;
};

export default useGetSessionData;
