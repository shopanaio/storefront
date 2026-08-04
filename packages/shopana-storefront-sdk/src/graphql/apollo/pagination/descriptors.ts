import { definePaginationQuery } from './definePaginationQuery';
import {
  SdkCategoryQueryDocument,
  SdkCollectionQueryDocument,
  SdkProductQueryDocument,
  SdkSearchQueryDocument,
} from '../generated/operations';

export const CategoryPagination = definePaginationQuery({
  query: SdkCategoryQueryDocument,
  getConnection: (data) => data.category?.listing,
  getNextVariables: ({ variables, count, endCursor }) => ({
    ...variables,
    first: count,
    after: endCursor,
  }),
});

export const CollectionPagination = definePaginationQuery({
  query: SdkCollectionQueryDocument,
  getConnection: (data) => data.category?.listing,
  getNextVariables: ({ variables, count, endCursor }) => ({
    ...variables,
    first: count,
    after: endCursor,
  }),
});

export const ProductReviewsPagination = definePaginationQuery({
  query: SdkProductQueryDocument,
  getConnection: (data) => data.product?.reviews,
  getNextVariables: ({ variables, count, endCursor }) => ({
    ...variables,
    first: count,
    after: endCursor,
  }),
});

export const SearchPagination = definePaginationQuery({
  query: SdkSearchQueryDocument,
  getConnection: (data) => data.searchProducts,
  getNextVariables: ({ variables, count, endCursor }) => ({
    ...variables,
    first: count,
    after: endCursor,
  }),
});
