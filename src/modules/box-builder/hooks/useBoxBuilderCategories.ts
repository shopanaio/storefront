import { useLazyLoadQuery } from "react-relay";
import { BoxBuilderCategoriesQuery as BoxBuilderCategoriesQueryDoc } from "@src/relay/queries/BoxBuilderCategoriesQuery.shopana";
import { BoxBuilderCategoriesQuery as BoxBuilderCategoriesQueryType } from "@src/relay/queries/__generated__/BoxBuilderCategoriesQuery.graphql";
import { BOX_BUILDER_CONFIG } from "../config/categories";

export const useBoxBuilderCategories = () => {
  const data = useLazyLoadQuery<BoxBuilderCategoriesQueryType>(
    BoxBuilderCategoriesQueryDoc,
    {},
    { fetchPolicy: "store-or-network" }
  );

  // Transform the dynamic query result back to a structured format
  const categories = BOX_BUILDER_CONFIG.step2.categories.map((categoryConfig, index) => {
    const alias = `category${index}` as keyof typeof data;
    const categoryData = data[alias];

    return {
      ...categoryData,
      config: categoryConfig, // Include original config for additional metadata
    };
  }).filter(Boolean); // Filter out any null/undefined categories

  return {
    categories,
    error: null,
    loading: false,
    config: BOX_BUILDER_CONFIG.step2
  };
};
