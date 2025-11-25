import { OperationType, RequestParameters, VariablesOf } from 'relay-runtime';
import { ConcreteRequest } from 'relay-runtime/lib/util/RelayConcreteNode';
import { createFetchGraphQL } from './Environment';
import { loadSerializableQuery, SerializablePreloadedQuery } from './loadSerializableQuery';
import type { RelayEnvironmentConfig } from './types';

export type ServerQueryLoader = <
  TRequest extends ConcreteRequest,
  TQuery extends OperationType
>(
  params: RequestParameters,
  variables: VariablesOf<TQuery>
) => Promise<SerializablePreloadedQuery<TRequest, TQuery>>;

/**
 * Create a server query loader function configured with environment settings.
 * Use this to load GraphQL queries in Next.js Server Components.
 *
 * @param environmentConfig - Relay environment configuration
 * @returns A function that loads serializable queries
 *
 * @example
 * ```ts
 * // src/lib/serverQuery.ts
 * import { createServerQueryLoader } from '@shopana/storefront-sdk/graphql/relay';
 * import { environmentConfig } from '@/config/environment.config';
 *
 * export const loadServerQuery = createServerQueryLoader(environmentConfig);
 *
 * // Usage in Server Component:
 * import { loadServerQuery } from '@/lib/serverQuery';
 * import MyQueryNode from './__generated__/MyQuery.graphql';
 *
 * const data = await loadServerQuery(MyQueryNode.params, { id: '123' });
 * ```
 */
export function createServerQueryLoader(
  environmentConfig: RelayEnvironmentConfig
): ServerQueryLoader {
  return async function loadServerQuery<
    TRequest extends ConcreteRequest,
    TQuery extends OperationType
  >(
    params: RequestParameters,
    variables: VariablesOf<TQuery>
  ): Promise<SerializablePreloadedQuery<TRequest, TQuery>> {
    // Dynamic import to avoid bundling next/headers in client code
    const { headers } = await import('next/headers');
    const cookie = (await headers()).get('cookie') ?? undefined;

    const networkFetch = createFetchGraphQL({
      graphqlUrl: environmentConfig.graphqlUrl,
      apiKeyHeader: environmentConfig.apiKeyHeader,
      apiKey: environmentConfig.apiKey,
      accessTokenCookieName: environmentConfig.accessTokenCookieName,
      serverCookies: cookie,
    });

    return loadSerializableQuery<TRequest, TQuery>(
      networkFetch,
      params,
      variables,
      cookie
    );
  };
}
