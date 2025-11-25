import { graphql } from 'relay-runtime';

export const CategoryFragment = graphql`
  fragment CategoryFragment_category on Category {
    id
    title
    handle
    listing(first: 12) {
      edges {
        node {
          ... on ProductVariant {
            id
            title
            handle
            cover {
              url
              source
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            product {
              id
              title
              handle
            }
          }
        }
      }
    }
  }
`;
