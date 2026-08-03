import { graphql } from 'relay-runtime';

export const HomePageQuery = graphql`
  query HomePageQuery {
    electronics: categoryByHandle(handle: "electronics") {
      title: name
      ...CategoryFragment_category
    }
    toys: categoryByHandle(handle: "toys-kids") {
      title: name
      ...CategoryFragment_category
    }
    sport: categoryByHandle(handle: "sport-i-otdyh") {
      title: name
      ...CategoryFragment_category
    }
    homeAndGarden: categoryByHandle(handle: "home-garden") {
      id
      title: name
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
