import { graphql } from "relay-runtime";

const ProductQuery = graphql`
  query ProductQuery(
    $handle: String!
    $first: Int = 3
    $after: Cursor
    $sort: ProductReviewSort = CREATED_AT_DESC
  ) {
    product(handle: $handle) {
      id
      title
      handle
      description
      excerpt
      options {
        id
        handle
        title
        displayType
        values {
          id
          title
          handle
          swatch {
            id
            color
            displayType
            image {
              url
              source
              id
            }
          }
        }
      }
      selectedOptions
      cover {
        id
        url
      }
      gallery(first: 20) {
        edges {
          node {
            id
            url
          }
        }
      }
      price {
        currencyCode
        amount
      }
      compareAtPrice {
        currencyCode
        amount
      }
      sku
      stockStatus {
        isAvailable
      }
      category {
        id
        title
        handle
        breadcrumbs{
          id
          title
          handle
        }
      }
      variants {
        id
        handle
        title
        selectedOptions
        cover {
          id
          url
          source
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
      tags(first: 10) {
        edges {
          node {
            id
            handle
            title
          }
        }
      }
      groups {
        id
        title
        isRequired
        isMultiple
        items {
          product {
            id
            title
            handle
            price {
              amount
              currencyCode
            }
            cover {
              id
              url
            }
          }
          maxQuantity
          price {
            amount {
              currencyCode
              amount
            }
            percentage
          }
        }
      }
      seoTitle
      seoDescription
      productType
      containerId
      createdAt
      updatedAt
      rating {
        id
        count
        rating
        breakdown {
          star
          count
          percentage
        }
      }
      ...Reviews @arguments(first: $first, after: $after, sort: $sort)
    }
  }
`;

export default ProductQuery;