import { graphql } from 'relay-runtime';

export const HomePageQuery = graphql`
  query HomePageQuery {
    electronics: category(handle: "electronics") {
      title
      ...CategoryFragment_category
    }
    toys: category(handle: "toys-kids") {
      title
      ...CategoryFragment_category
    }
    sport: category(handle: "sport-i-otdyh") {
      title
      ...CategoryFragment_category
    }
    homeAndGarden: category(handle: "home-garden") {
      id
      title
      handle
      children(first: 10) {
        edges {
          node {
            ...CategoryFragment_category
          }
        }
      }
    }
  }
`;

export { default as HomePageQueryNode } from './__generated__/HomePageQuery.graphql';
export type { HomePageQuery as HomePageQueryType } from './__generated__/HomePageQuery.graphql';
