import { useEffect } from 'react';
import { ListingSort as LegacyListingSort } from '@codegen/schema-client';
import type {
  ListingFilterInput,
  ListingSort,
} from '../../../../codegen/apollo/storefront-operations';
import { PAGINATION_PAGE_SIZE } from '@src/config';
export const mapListingSort = (sort: LegacyListingSort): ListingSort => {
  switch (sort) {
    case LegacyListingSort.PriceAsc:
      return 'PRICE_ASC';
    case LegacyListingSort.PriceDesc:
      return 'PRICE_DESC';
    case LegacyListingSort.TitleAsc:
      return 'TITLE_ASC';
    case LegacyListingSort.TitleDesc:
      return 'TITLE_DESC';
    case LegacyListingSort.CreatedAtAsc:
      return 'CREATED_AT';
    case LegacyListingSort.CreatedAtDesc:
      return 'NEWEST';
    case LegacyListingSort.MostRelevant:
    default:
      return 'MANUAL';
  }
};
const useCategoryRefetch = (
  sort: LegacyListingSort,
  filters: ListingFilterInput[],
  refetch: (variables: {
    sort: ListingSort;
    filters: ListingFilterInput[];
    after?: string;
    first?: number;
  }) => void
) => {
  useEffect(() => {
    refetch({
      sort: mapListingSort(sort),
      filters,
      after: undefined,
      first: PAGINATION_PAGE_SIZE,
    });
  }, [sort, filters, refetch]);
};
export default useCategoryRefetch;
