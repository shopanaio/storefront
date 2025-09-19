import { headers } from "next/headers";
import loadSerializableQuery, {
  SerializablePreloadedQuery,
} from "@src/relay/loadSerializableQuery";
import CollectionByHandleQueryNode, {
  CollectionByHandleQuery,
} from "@src/relay/queries/__generated__/CollectionByHandleQuery.graphql";

interface LoadCategoryServerQueryParams {
  handle: string;
  first?: number;
  sort?: unknown;
  filters?: unknown[];
}

const loadCategoryServerQuery = async ({
  handle,
}: LoadCategoryServerQueryParams): Promise<
  SerializablePreloadedQuery<typeof CollectionByHandleQueryNode, CollectionByHandleQuery>
> => {
  const cookie = headers().get("cookie") ?? undefined;

  const preloadedQuery = await loadSerializableQuery<
    typeof CollectionByHandleQueryNode,
    CollectionByHandleQuery
  >(
    CollectionByHandleQueryNode.params,
    {
      handle,
    },
    cookie
  );

  return preloadedQuery;
};

export default loadCategoryServerQuery;