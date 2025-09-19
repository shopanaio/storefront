import { useLazyLoadQuery } from "react-relay";
import { CategoryQuery } from "@src/relay/queries/CategoryQuery.shopana";
import { CategoryQuery as CategoryQueryType } from "@src/relay/queries/__generated__/CategoryQuery.graphql";

const useCategoryClientQuery = (handle: string, first: number = 12) => {
  const data = useLazyLoadQuery<CategoryQueryType>(
    CategoryQuery,
    { handle, first },
    { fetchPolicy: "store-or-network" }
  );

  return data?.category ?? null;
};

export default useCategoryClientQuery;