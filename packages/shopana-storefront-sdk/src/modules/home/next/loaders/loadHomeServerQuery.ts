import { loadSerializableQuery } from '../../../../graphql/relay/loadSerializableQuery';
import type { SerializablePreloadedQuery } from '../../../../graphql/relay/loadSerializableQuery';
import { createFetchGraphQL } from '../../../../graphql/relay/Environment';
import type { RelayEnvironmentConfig } from '../../../../graphql/relay/types';
import HomePageQueryNode, {
  HomePageQuery as HomePageQueryType,
} from '../../core/graphql/queries/__generated__/HomePageQuery.graphql';

export interface LoadHomeServerQueryOptions {
  environmentConfig: RelayEnvironmentConfig;
}

export async function loadHomeServerQuery(
  options: LoadHomeServerQueryOptions,
): Promise<
  SerializablePreloadedQuery<typeof HomePageQueryNode, HomePageQueryType>
> {
  const { environmentConfig } = options;

  const { headers } = await import('next/headers');
  const cookie = (await headers()).get('cookie') ?? undefined;

  const networkFetch = createFetchGraphQL({
    graphqlUrl: environmentConfig.graphqlUrl,
    apiKeyHeader: environmentConfig.apiKeyHeader,
    apiKey: environmentConfig.apiKey,
    accessTokenCookieName: environmentConfig.accessTokenCookieName,
    serverCookies: cookie,
  });

  const preloadedQuery = await loadSerializableQuery<
    typeof HomePageQueryNode,
    HomePageQueryType
  >(networkFetch, HomePageQueryNode.params, {}, cookie);

  return preloadedQuery;
}

export type { HomePageQueryType };
