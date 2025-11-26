import { useLazyLoadQuery } from "react-relay";
import CategoryQuery, { CategoryQuery as CategoryQueryType } from "@shopana/storefront-sdk/queries/CategoryQuery";
import { PAGINATION_PAGE_SIZE } from "@src/config";

const useCategoryClientQuery = (handle: string, first: number = PAGINATION_PAGE_SIZE) => {
  const data = useLazyLoadQuery<CategoryQueryType>(
    CategoryQuery,
    { handle, first },
    { fetchPolicy: "store-or-network" }
  );

  return data?.category ?? null;
};

export default useCategoryClientQuery;
