import { headers } from 'next/headers';
import loadSerializableQuery, {
  SerializablePreloadedQuery,
} from '@src/relay/loadSerializableQuery';
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
  const cookie = headers().get('cookie') ?? undefined;

  const preloadedQuery = await loadSerializableQuery<
    typeof CategoryQueryNode,
    CategoryQuery
  >(
    CategoryQueryNode.params,
    {
      handle,
    },
    cookie
  );

  return preloadedQuery;
};

export default loadCategoryServerQuery;
