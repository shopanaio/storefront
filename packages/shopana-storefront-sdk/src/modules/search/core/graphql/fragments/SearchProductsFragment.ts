import { graphql } from 'relay-runtime';

export const SearchProductsFragment = graphql`
  fragment SearchProductsFragment on ProductConnection {
    totalCount
    sort
    availableSorts
    filters {
      id
      handle: id
      label
      title: label
      type
      priceRange {
        min { amount currencyCode }
        max { amount currencyCode }
        selectedMin { amount currencyCode }
        selectedMax { amount currencyCode }
      }
      values {
        id
        handle: id
        label
        title: label
        count
        selected
        input
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
      edges {
        cursor
        node {
          ...SearchProductCardFragment
      }
    }
  }
`;

export { default as SearchProductsFragmentNode } from './__generated__/SearchProductsFragment.graphql';
export type { SearchProductsFragment$key, SearchProductsFragment$data } from './__generated__/SearchProductsFragment.graphql';
