import { PreloadedQuery, usePreloadedQuery } from "react-relay";
import ProductQuery from "@src/hooks/product/ProductQuery";
import { ProductQuery as ProductQueryType } from "@src/hooks/product/ProductQuery/__generated__/ProductQuery.graphql";

const usePreloadedProduct = (queryReference: PreloadedQuery<ProductQueryType>) => {
  const data = usePreloadedQuery<ProductQueryType>(
    ProductQuery,
    queryReference
  );

  const product = data?.product ?? null;

  return product;
};

export default usePreloadedProduct;