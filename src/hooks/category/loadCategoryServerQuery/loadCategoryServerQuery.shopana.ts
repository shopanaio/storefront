
import { headers } from "next/headers";
import loadSerializableQuery, {
  SerializablePreloadedQuery,
} from "@src/relay/loadSerializableQuery";
import CategoryQueryNode, {
  CategoryQuery,
} from "@src/relay/queries/__generated__/CategoryQuery.graphql";
import { ListingSort } from "@codegen/schema-client";

interface LoadCategoryServerQueryParams {
  handle: string;
  first?: number;
  sort?: ListingSort;
  filters?: any[];
}

const loadCategoryServerQuery = async ({
  handle,
  first = 24,
  sort = ListingSort.MostRelevant,
  filters = [],
}: LoadCategoryServerQueryParams): Promise<
  SerializablePreloadedQuery<any, any>
> => {
  const cookie = headers().get("cookie") ?? undefined;

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
