import { useLazyLoadQuery } from "react-relay";
import { CategoryQuery } from "@src/relay/queries/CategoryQuery.shopana";
import { CategoryQuery as CategoryQueryType } from "@src/relay/queries/__generated__/CategoryQuery.graphql";
import { PAGINATION_PAGE_SIZE } from "@src/config";

export const useCategory = (handle: string, first: number = PAGINATION_PAGE_SIZE) => {
  const data = useLazyLoadQuery<CategoryQueryType>(
    CategoryQuery,
    { handle, first },
    { fetchPolicy: "store-or-network" }
  );

  const category = data?.category ?? null;

  return {
    category,
    error: null,
    loading: false,
  };
};
