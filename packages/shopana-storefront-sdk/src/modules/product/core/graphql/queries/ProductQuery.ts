import { graphql } from 'relay-runtime';

export const ProductQuery = graphql`
  query ProductQuery(
    $handle: String!
    $first: Int = 3
    $after: Cursor
    $sort: ProductReviewSort = HELPFUL_YES_DESC
  ) {
    product(handle: $handle) {
      ...Reviews @arguments(first: $first, after: $after, sort: $sort)
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
              id
            }
          }
        }
      }
      category {
        id
        title
        handle
        breadcrumbs {
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
          node {
            ... on ProductVariant {
              id
              title
              handle
              product {
                title
                handle
              }
              price {
                amount
                currencyCode
              }
              cover {
                id
                url
              }
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
    }
  }
`;

export { default as ProductQueryNode } from './__generated__/ProductQuery.graphql';
export type { ProductQuery as ProductQueryType } from './__generated__/ProductQuery.graphql';
