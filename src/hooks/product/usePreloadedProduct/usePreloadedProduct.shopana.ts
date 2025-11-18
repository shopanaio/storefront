import { PreloadedQuery, usePreloadedQuery } from "react-relay";
import ProductQuery from "@src/hooks/product/ProductQuery";
import { ProductQuery as ProductQueryType } from "@src/hooks/product/ProductQuery/__generated__/ProductQuery.graphql";
import { mapApiProductToProduct } from "@src/hooks/product/mapApiProductToProduct";
import type { UsePreloadedProductResult } from "./types";
import type { Reviews$key } from "@src/queries/Reviews/__generated__/Reviews.graphql";

const usePreloadedProduct = (
  queryReference: PreloadedQuery<ProductQueryType>
): UsePreloadedProductResult => {
  const data = usePreloadedQuery<ProductQueryType>(
    ProductQuery,
    queryReference
  );

  const apiProduct = data?.product ?? null;
  const product = mapApiProductToProduct(apiProduct);

  return {
    product,
    productReviewsRef: apiProduct as Reviews$key | null,
  };
};

export default usePreloadedProduct;
