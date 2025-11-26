import { loadSerializableQuery } from '../../../../graphql/relay/loadSerializableQuery';
import type { SerializablePreloadedQuery } from '../../../../graphql/relay/loadSerializableQuery';
import { createFetchGraphQL } from '../../../../graphql/relay/Environment';
import type { RelayEnvironmentConfig } from '../../../../graphql/relay/types';
import CollectionQueryNode, {
  CollectionQuery as CollectionQueryType,
} from '../../core/graphql/queries/__generated__/CollectionQuery.graphql';

export type CollectionSort = 'MOST_RELEVANT' | 'PRICE_ASC' | 'PRICE_DESC' | 'CREATED_AT_DESC' | 'CREATED_AT_ASC' | 'TITLE_ASC' | 'TITLE_DESC';

export interface CollectionFilterInput {
  handle: string;
  values: readonly string[];
}

export interface LoadCollectionServerQueryOptions {
  environmentConfig: RelayEnvironmentConfig;
  handle: string;
  first?: number;
  after?: string | null;
  sort?: CollectionSort;
  filters?: CollectionFilterInput[];
}

export async function loadCollectionServerQuery(
  options: LoadCollectionServerQueryOptions,
): Promise<
  SerializablePreloadedQuery<typeof CollectionQueryNode, CollectionQueryType>
> {
  const {
    environmentConfig,
    handle,
    first = 24,
    after = null,
    sort = 'MOST_RELEVANT',
    filters = [],
  } = options;

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
    typeof CollectionQueryNode,
    CollectionQueryType
  >(networkFetch, CollectionQueryNode.params, {
    handle,
    first,
    after,
    sort,
    filters,
  }, cookie);

  return preloadedQuery;
}

export type { CollectionQueryType };
