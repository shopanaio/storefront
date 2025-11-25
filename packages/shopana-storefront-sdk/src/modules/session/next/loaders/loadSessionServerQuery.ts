import { loadSerializableQuery } from '../../../../graphql/relay/loadSerializableQuery';
import type { SerializablePreloadedQuery } from '../../../../graphql/relay/loadSerializableQuery';
import { createFetchGraphQL } from '../../../../graphql/relay/Environment';
import type { RelayEnvironmentConfig } from '../../../../graphql/relay/types';
import loadSessionQueryNode, {
  loadSessionQuery as LoadSessionQueryType,
} from '../../core/graphql/queries/__generated__/loadSessionQuery.graphql';

export interface LoadSessionServerQueryOptions {
  /**
   * Relay environment configuration (GraphQL URL, API key, etc.)
   */
  environmentConfig: RelayEnvironmentConfig;
}

/**
 * Load session data on server (Next.js)
 * Use this in Server Components to prefetch session data
 *
 * @param options - Configuration options
 * @returns Preloaded query or null if no access token
 *
 * @example
 * ```ts
 * import { loadSessionServerQuery } from '@shopana/storefront-sdk/modules/session/next';
 *
 * const sessionData = await loadSessionServerQuery({
 *   environmentConfig,
 * });
 * ```
 */
export async function loadSessionServerQuery(
  options: LoadSessionServerQueryOptions
): Promise<SerializablePreloadedQuery<typeof loadSessionQueryNode, LoadSessionQueryType> | null> {
  const { environmentConfig } = options;

  // Dynamic import to avoid bundling next/headers in client code
  const { headers } = await import('next/headers');
  const cookie = (await headers()).get('cookie') ?? undefined;

  // Create networkFetch from environment config
  const networkFetch = createFetchGraphQL({
    graphqlUrl: environmentConfig.graphqlUrl,
    apiKeyHeader: environmentConfig.apiKeyHeader,
    apiKey: environmentConfig.apiKey,
    accessTokenCookieName: environmentConfig.accessTokenCookieName,
    serverCookies: cookie,
  });

  try {
    const preloadedQuery = await loadSerializableQuery<
      typeof loadSessionQueryNode,
      LoadSessionQueryType
    >(
      networkFetch,
      loadSessionQueryNode.params,
      {},
      cookie
    );

    return preloadedQuery;
  } catch (error) {
    // Session not found or unauthorized - return null
    console.log('[loadSessionServerQuery] Session not found or error:', error);
    return null;
  }
}
