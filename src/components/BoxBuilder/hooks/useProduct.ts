import { useLazyLoadQuery } from "react-relay";
import { ProductQuery } from "@src/relay/queries/ProductQuery.shopana";
import { ProductQuery as ProductQueryType } from "@src/relay/queries/__generated__/ProductQuery.graphql";

export const useProduct = (handle: string) => {
  const data = useLazyLoadQuery<ProductQueryType>(
    ProductQuery,
    { handle },
    { fetchPolicy: "store-or-network" },
  );

  const product = data?.product ?? null;

  return {
    product,
    error: null,
    loading: false,
  };
};
