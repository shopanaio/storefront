import { useLazyLoadQuery } from '@shopana/storefront-sdk/graphql/apollo';
import { ListingSort } from '@codegen/schema-client';

import SearchQuery from '@src/hooks/search/SearchQuery/SearchQuery.shopana';

interface ExtendedFilterInput {
  handle: string;
  values: string[];
  inputs?: string[];
}

interface UseSearchPaginationParams {
  query: string;
  after: string | null;
  sort: ListingSort;
  filters: ExtendedFilterInput[];
}

export const useSearchPagination = ({
  query,
  after,
  sort,
  filters,
}: UseSearchPaginationParams) => {
  const data = useLazyLoadQuery(
    SearchQuery,
    {
      query,
      first: 12,
      after,
      sort,
      filters,
    },
    {
      fetchPolicy: 'network-only',
      fetchKey: `${query}-${sort}-${JSON.stringify(filters)}-${after}`,
    }
  );

  return {
    products: data.searchProducts,
    loading: false,
    error: null,
  };
};
