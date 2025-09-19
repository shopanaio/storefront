import { graphql } from "relay-runtime";

export const HomePageQuery = graphql`
  query HomePageQuery {
    electronics: collection(handle: "electronics") {
      title
      ...useProductSlideshowFragment_category
    }
    toys: collection(handle: "toys") {
      title
      ...useProductSlideshowFragment_category
    }
    jevelery: collection(handle: "jevelery") {
      title
      ...useProductSlideshowFragment_category
    }
    garden: collection(handle: "garden") {
      title
      ...useProductSlideshowFragment_category
    }
  }
`;
