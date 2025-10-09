import { useLazyLoadQuery } from "react-relay";
import ProductQuery from "@src/hooks/product/ProductQuery";
import { ProductQuery as ProductQueryType } from "@src/hooks/product/ProductQuery/__generated__/ProductQuery.graphql";
import { mapApiProductToProduct } from "@src/hooks/product/mapApiProductToProduct";

const useProduct = (handle: string) => {
  const data = useLazyLoadQuery<ProductQueryType>(
    ProductQuery,
    { handle },
    { fetchPolicy: "store-or-network" }
  );

  const apiProduct = data?.product ?? null;
  const product = mapApiProductToProduct(apiProduct);

  return {
    product,
    error: null,
    loading: false,
  };
};

export default useProduct;
