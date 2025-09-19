import { graphql } from "relay-runtime";

const ProductQuery = graphql`
  query ProductQuery(
    $handle: String!
  ) {
    product(handle: $handle) {
      id
      title
      handle
      description
      options {
        id
        name
        values
      }
      featuredImage {
        id
        url
        altText
      }
      images(first: 20) {
        edges {
          node {
            id
            url
            altText
          }
        }
      }
      priceRange {
        minVariantPrice {
          currencyCode
          amount
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          currencyCode
          amount
        }
      }
      availableForSale
      category {
        id
        name
      }
      variants(first: 250) {
        edges {
          node {
            id
            title
            selectedOptions {
              name
              value
            }
            image {
              id
              url
              altText
            }
            price {
              currencyCode
              amount
            }
            compareAtPrice {
              currencyCode
              amount
            }
          }
        }
      }
      tags
      productType
      createdAt
      updatedAt
    }
  }
`;

export default ProductQuery;