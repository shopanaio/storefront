import {
  loadSerializableQuery,
  type SerializableApolloQuery,
} from '../../../../graphql/apollo/loadSerializableQuery';
import { getApolloRequestClient } from '../../../../next/apollo/server';
import type { ApolloEnvironmentConfig } from '../../../../graphql/apollo/types';
import {
  SdkSearchQueryDocument,
  type SdkSearchQuery,
  type SdkSearchQueryVariables,
  type ListingFilterInput,
  type ListingSort,
} from '../../../../graphql/apollo/generated/operations';
export type SearchSort = ListingSort;
export type SearchFilterInput = ListingFilterInput;
export interface LoadSearchServerQueryOptions {
  environmentConfig: ApolloEnvironmentConfig;
  query: string;
  first?: number;
  after?: string | null;
  sort?: SearchSort;
  filters?: SearchFilterInput[];
}
export async function loadSearchServerQuery(
  options: LoadSearchServerQueryOptions
): Promise<SerializableApolloQuery<SdkSearchQuery, SdkSearchQueryVariables>> {
  const {
    environmentConfig,
    query,
    first = 12,
    after = null,
    sort = 'RELEVANCE',
    filters = [],
  } = options;
  const client = await getApolloRequestClient(environmentConfig);
  return loadSerializableQuery(client, SdkSearchQueryDocument, {
    query: query.trim(),
    first,
    after,
    sort,
    filters,
  });
}
export type { SdkSearchQuery as SearchQueryType };
