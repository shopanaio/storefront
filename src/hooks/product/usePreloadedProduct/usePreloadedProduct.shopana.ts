import { PreloadedQuery, usePreloadedQuery } from "react-relay";
import ProductQuery from "@src/hooks/product/ProductQuery";
import { ProductQuery as ProductQueryType } from "@src/hooks/product/ProductQuery/__generated__/ProductQuery.graphql";
import { mapApiProductToProduct } from "@src/entity/Product/mapApiProductToProduct";

const usePreloadedProduct = (queryReference: PreloadedQuery<ProductQueryType>) => {
  const data = usePreloadedQuery<ProductQueryType>(
    ProductQuery,
    queryReference
  );

  const apiProduct = data?.product ?? null;
  const product = mapApiProductToProduct(apiProduct);

  return product;
};

export default usePreloadedProduct;
