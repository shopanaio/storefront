
import loadSerializableQuery from "@shopana/storefront-sdk/next/relay/loadSerializableQuery";
import type { SerializablePreloadedQuery } from "@shopana/storefront-sdk/next/relay/loadSerializableQuery";
import { environmentConfig } from "@src/config/environment.config";
import CategoryQueryNode, {
  CategoryQuery,
} from "@src/queries/CategoryQuery/__generated__/CategoryQuery.graphql";
import { ListingSort } from "@codegen/schema-client";
import { PAGINATION_PAGE_SIZE } from "@src/config";

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
  SerializablePreloadedQuery<any, any>
> => {
  const preloadedQuery = await loadSerializableQuery<
    typeof CategoryQueryNode,
    CategoryQuery
  >(
    environmentConfig,
    CategoryQueryNode.params,
    {
      handle,
      first,
      sort,
      filters,
    }
  );

  return preloadedQuery;
};

export default loadCategoryServerQuery;
