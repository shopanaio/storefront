import {
  loadSerializableQuery,
  type SerializableApolloQuery,
} from '../../../../graphql/apollo/loadSerializableQuery';
import { getApolloRequestClient } from '../../../../next/apollo/server';
import type { ApolloEnvironmentConfig } from '../../../../graphql/apollo/types';
import {
  SdkCollectionQueryDocument,
  type SdkCollectionQuery,
  type SdkCollectionQueryVariables,
  type ListingFilterInput,
  type ListingSort,
} from '../../../../graphql/apollo/generated/operations';
export type CollectionSort = ListingSort;
export type CollectionFilterInput = ListingFilterInput;
export interface LoadCollectionServerQueryOptions {
  environmentConfig: ApolloEnvironmentConfig;
  handle: string;
  first?: number;
  after?: string | null;
  sort?: CollectionSort;
  filters?: CollectionFilterInput[];
}
export async function loadCollectionServerQuery(
  options: LoadCollectionServerQueryOptions
): Promise<
  SerializableApolloQuery<SdkCollectionQuery, SdkCollectionQueryVariables>
> {
  const {
    environmentConfig,
    handle,
    first = 24,
    after = null,
    sort = 'MANUAL',
    filters = [],
  } = options;
  const client = await getApolloRequestClient(environmentConfig);
  return loadSerializableQuery(client, SdkCollectionQueryDocument, {
    handle,
    first,
    after,
    sort,
    filters,
  });
}
export type { SdkCollectionQuery as CollectionQueryType };
