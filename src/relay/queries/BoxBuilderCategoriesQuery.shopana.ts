/* eslint-disable */
import { graphql } from "relay-runtime";

export const BoxBuilderCategoriesQuery = graphql`
  query BoxBuilderCategoriesQuery {
    electronics: category(handle: "electronics") {
      title
      handle
      ...Listing
    }
    sport: category(handle: "sport-i-otdyh") {
      title
      handle
      ...Listing
    }
    toys: category(handle: "toys-kids") {
      title
      handle
      ...Listing
    }
  }
`;
