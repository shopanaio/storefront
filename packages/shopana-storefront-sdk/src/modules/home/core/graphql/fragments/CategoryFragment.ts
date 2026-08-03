import { graphql } from 'relay-runtime';

export const CategoryFragment = graphql`
  fragment CategoryFragment_category on Category @inline {
    id
    title: name
    handle
    listing: products(first: 12) {
      edges {
        node {
          id
          title
          handle
          featuredMedia {
            ... on MediaImage {
              id
              image {
                url
              }
            }
          }
          selectedOrFirstAvailableVariant {
            id
            title
            handle
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;
