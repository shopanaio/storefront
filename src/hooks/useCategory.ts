import { useLazyLoadQuery } from '@shopana/storefront-sdk/graphql/apollo';
import CategoryQuery from '@shopana/storefront-sdk/queries/CategoryQuery';
import { PAGINATION_PAGE_SIZE } from '@src/config';

export const useCategory = (
  handle: string,
  first: number = PAGINATION_PAGE_SIZE
) => {
  const data = useLazyLoadQuery(
    CategoryQuery,
    { handle, first },
    { fetchPolicy: 'store-or-network' }
  );

  const category = data?.category ?? null;

  return {
    category,
    error: null,
    loading: false,
  };
};
