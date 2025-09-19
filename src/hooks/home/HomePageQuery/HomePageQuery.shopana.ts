import { graphql } from "relay-runtime";

export const HomePageQuery = graphql`
  query HomePageQuery {
    electronics: category(handle: "electronics") {
      title
      ...useProductSlideshowFragment_category
    }
    toys: category(handle: "toys-kids") {
      title
      ...useProductSlideshowFragment_category
    }
    sport: category(handle: "sport-i-otdyh") {
      title
      ...useProductSlideshowFragment_category
    }
    homeAndGarden: category(handle: "home-garden") {
      id
      title
      handle
      children(first: 10) {
        edges {
          node {
            ...useProductSlideshowFragment_category
          }
        }
      }
    }
  }
`;
