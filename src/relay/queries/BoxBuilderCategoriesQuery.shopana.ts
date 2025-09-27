/* eslint-disable */
import { graphql } from "relay-runtime";
import { BOX_BUILDER_CONFIG } from "@src/modules/box-builder/config/categories";

/**
 * Generate dynamic GraphQL query for box builder categories
 * This query is built dynamically based on the categories config
 */
const generateCategoriesQuery = () => {
  const categories = BOX_BUILDER_CONFIG.step2.categories;

  const categoryQueries = categories.map((category, index) => {
    // Use category handle as alias, but ensure it's a valid GraphQL field name
    const alias = `category${index}`;
    return `
    ${alias}: category(handle: "${category.handle}") {
      title
      handle
      ...Listing
    }`;
  }).join('');

  return `
  query BoxBuilderCategoriesQuery {${categoryQueries}
  }
  `;
};

export const BoxBuilderCategoriesQuery = graphql(generateCategoriesQuery());
