import { loadSerializableQuery } from '../../../../graphql/relay/loadSerializableQuery';
import type { SerializablePreloadedQuery } from '../../../../graphql/relay/loadSerializableQuery';
import { createFetchGraphQL } from '../../../../graphql/relay/Environment';
import type { RelayEnvironmentConfig } from '../../../../graphql/relay/types';
import SearchQueryNode, {
  SearchQuery as SearchQueryType,
} from '../../core/graphql/queries/__generated__/SearchQuery.graphql';

export type SearchSort = 'MOST_RELEVANT' | 'PRICE_ASC' | 'PRICE_DESC' | 'CREATED_AT_DESC' | 'CREATED_AT_ASC' | 'TITLE_ASC' | 'TITLE_DESC';

export interface SearchFilterInput {
  handle: string;
  values: readonly string[];
}

export interface LoadSearchServerQueryOptions {
  environmentConfig: RelayEnvironmentConfig;
  query: string;
  first?: number;
  after?: string | null;
  sort?: SearchSort;
  filters?: SearchFilterInput[];
}

export async function loadSearchServerQuery(
  options: LoadSearchServerQueryOptions,
): Promise<
  SerializablePreloadedQuery<typeof SearchQueryNode, SearchQueryType>
> {
  const {
    environmentConfig,
    query,
    first = 12,
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
    typeof SearchQueryNode,
    SearchQueryType
  >(networkFetch, SearchQueryNode.params, {
    query: query.trim(),
    first,
    after,
    sort,
    filters,
  }, cookie);

  return preloadedQuery;
}

export type { SearchQueryType };
