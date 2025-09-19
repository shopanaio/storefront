import { useLazyLoadQuery } from "react-relay";
import { BoxBuilderCategoriesQuery as BoxBuilderCategoriesQueryDoc } from "@src/relay/queries/BoxBuilderCategoriesQuery.shopana";
import { BoxBuilderCategoriesQuery as BoxBuilderCategoriesQueryType } from "@src/relay/queries/__generated__/BoxBuilderCategoriesQuery.graphql";

export const useBoxBuilderCategories = () => {
  const data = useLazyLoadQuery<BoxBuilderCategoriesQueryType>(
    BoxBuilderCategoriesQueryDoc,
    {},
    { fetchPolicy: "store-or-network" }
  );
  return { categories: data, error: null, loading: false };
};
