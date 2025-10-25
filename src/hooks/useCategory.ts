import { useLazyLoadQuery } from "react-relay";
import CategoryQuery from "@src/queries/CategoryQuery";
import { CategoryQuery as CategoryQueryType } from "@src/queries/CategoryQuery/__generated__/CategoryQuery.graphql";
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
