import {
  loadSerializableQuery,
  type SerializableApolloQuery,
} from '@shopana/storefront-sdk/graphql/apollo';
import { getApolloRequestClient } from '@shopana/storefront-sdk/next/apollo/server';
import { environmentConfig } from '@src/config/environment.config';
import {
  SdkCategoryQueryDocument,
  type SdkCategoryQuery,
  type SdkCategoryQueryVariables,
} from '@shopana/storefront-sdk/graphql/apollo/generated/operations';
import { ListingSort } from '@codegen/schema-client';
import { PAGINATION_PAGE_SIZE } from '@src/config';

interface LoadCategoryServerQueryParams {
  handle: string;
  first?: number;
  sort?: ListingSort;
  filters?: any[];
}

const loadCategoryServerQuery = async ({
  handle,
  first = PAGINATION_PAGE_SIZE,
  sort = ListingSort.MostRelevant,
  filters = [],
}: LoadCategoryServerQueryParams): Promise<
  SerializableApolloQuery<SdkCategoryQuery, SdkCategoryQueryVariables>
> => {
  const client = await getApolloRequestClient(environmentConfig);
  return loadSerializableQuery(client, SdkCategoryQueryDocument, {
    handle,
    first,
    sort: sort as never,
    filters,
  });
};

export default loadCategoryServerQuery;
