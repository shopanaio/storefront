import { useApolloClient } from '@apollo/client/react';
import { fetchQuery } from '@shopana/storefront-sdk/graphql/apollo';
import ProductQuery from '@src/hooks/product/ProductQuery';
import { ReviewSort } from 'codegen/schema-client';
import {
  PRODUCT_REVIEWS_DEFAULT_SORT,
  PRODUCT_REVIEWS_PAGE_SIZE,
} from '@src/templates/product/blocks/Rate/config';

export const useFetchMoreReviews = (
  handle: string,
  first: number = PRODUCT_REVIEWS_PAGE_SIZE,
  sort: ReviewSort = PRODUCT_REVIEWS_DEFAULT_SORT
) => {
  const client = useApolloClient();

  const fetchMoreReviews = async (after?: string | null) => {
    const response = await fetchQuery(client, ProductQuery, {
      handle,
      first,
      after,
      sort,
    });
    return response?.product?.reviews;
  };

  return fetchMoreReviews;
};
