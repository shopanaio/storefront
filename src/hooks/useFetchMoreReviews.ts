import { fetchQuery } from "relay-runtime";
import { useRelayEnvironment } from "react-relay";
import ProductQuery from "@src/hooks/product/ProductQuery";
import { ProductQuery as ProductQueryType } from "@src/hooks/product/ProductQuery/__generated__/ProductQuery.graphql";
import { ProductReviewSort } from "codegen/schema-client";
import {
  PRODUCT_REVIEWS_DEFAULT_SORT,
  PRODUCT_REVIEWS_PAGE_SIZE,
} from "@src/templates/product/blocks/Rate/config";

export const useFetchMoreReviews = (
  handle: string,
  first: number = PRODUCT_REVIEWS_PAGE_SIZE,
  sort: ProductReviewSort = PRODUCT_REVIEWS_DEFAULT_SORT
) => {
  const environment = useRelayEnvironment();

  const fetchMoreReviews = async (after?: string | null) => {
    const response = await fetchQuery<ProductQueryType>(
      environment,
      ProductQuery,
      { handle, first, after, sort }
    ).toPromise();
    return response?.product?.reviews;
  };

  return fetchMoreReviews;
};
