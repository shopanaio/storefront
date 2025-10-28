
import { headers } from "next/headers";
import loadSerializableQuery, {
  SerializablePreloadedQuery,
} from "@src/relay/loadSerializableQuery";
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
  const cookie = (await headers()).get("cookie") ?? undefined;

  const preloadedQuery = await loadSerializableQuery<
    typeof CategoryQueryNode,
    CategoryQuery
  >(
    CategoryQueryNode.params,
    {
      handle,
      first,
      sort,
      filters,
    },
    cookie
  );

  return preloadedQuery;
};

export default loadCategoryServerQuery;
