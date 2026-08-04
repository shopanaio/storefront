import {
  loadSerializableQuery,
  type SerializableApolloQuery,
} from '../../../../graphql/apollo/loadSerializableQuery';
import type { ApolloEnvironmentConfig } from '../../../../graphql/apollo/types';
import {
  SdkLoadSessionQueryDocument,
  type SdkLoadSessionQuery,
  type SdkLoadSessionQueryVariables,
} from '../../../../graphql/apollo/generated/operations';
import type { ApolloClient } from '@apollo/client';
import { getApolloRequestClient } from '../../../../next/apollo/server';
export interface LoadSessionServerQueryOptions {
  /**
   * Apollo environment configuration (GraphQL URL, API key, etc.)
   */
  environmentConfig: ApolloEnvironmentConfig;
  /** Reuse the request-scoped client when composing multiple root queries. */
  client?: ApolloClient;
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
): Promise<SerializableApolloQuery<
  SdkLoadSessionQuery,
  SdkLoadSessionQueryVariables
> | null> {
  const { environmentConfig } = options;
  const client =
    options.client ?? (await getApolloRequestClient(environmentConfig));
  try {
    return await loadSerializableQuery(client, SdkLoadSessionQueryDocument, {});
  } catch (error) {
    // Session not found or unauthorized - return null
    console.log('[loadSessionServerQuery] Session not found or error:', error);
    return null;
  }
}
