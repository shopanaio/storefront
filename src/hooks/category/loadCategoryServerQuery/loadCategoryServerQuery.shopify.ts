import {
  loadSerializableQuery,
  SerializablePreloadedQuery,
} from '@shopana/storefront-sdk/next/relay/server';
import { environmentConfig } from '@src/config/environment.config';
import CategoryQueryNode, {
  CategoryQuery,
} from '@src/queries/CategoryQuery/__generated__/CategoryQuery.graphql';

interface LoadCategoryServerQueryParams {
  handle: string;
  first?: number;
  sort?: unknown;
  filters?: unknown[];
}

const loadCategoryServerQuery = async ({
  handle,
}: LoadCategoryServerQueryParams): Promise<
  SerializablePreloadedQuery<typeof CategoryQueryNode, CategoryQuery>
> => {
  const preloadedQuery = await loadSerializableQuery<
    typeof CategoryQueryNode,
    CategoryQuery
  >(
    environmentConfig,
    CategoryQueryNode.params,
    {
      handle,
    }
  );

  return preloadedQuery;
};

export default loadCategoryServerQuery;
