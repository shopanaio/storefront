import { graphql } from 'relay-runtime';

export const ProductQuery = graphql`
  query ProductQuery(
    $handle: String!
    $first: Int = 3
    $after: Cursor
    $sort: ReviewSort = MOST_HELPFUL
    $componentSelections: [ProductComponentSelectionInput!]
  ) {
    product: productByHandle(handle: $handle) {
      ...Reviews @arguments(first: $first, after: $after, sort: $sort)
      id
      title
      handle
      description { text html json }
      excerpt { text html json }
      seo { title description }
      vendor { id name }
      options {
        id
        handle
        title: name
        displayType
        position
        values: optionValues {
          id
          title: name
          handle
          position
          swatch {
            color
            color2: secondaryColor
            displayType: type
            image {
              id
              ... on MediaImage { image { url } }
            }
          }
        }
      }
      category: primaryCategory {
        id
        title: name
        handle
        breadcrumbs: ancestors {
          id
          title: name
          handle
        }
      }
      featuredMedia {
        id
        ... on MediaImage { image { url width height altText } }
      }
      media(first: 20) {
        totalCount
        edges {
          cursor
          node {
            id
            alt
            mediaContentType
            ... on MediaImage { image { url width height altText } }
          }
        }
      }
      variants(first: 100) {
        totalCount
        edges {
          cursor
          node {
            ...ProductComponentConfigurationFragment
              @arguments(selections: $componentSelections)
            id
            handle
            title
            sku
            isDefault
            selectedOptions {
              name
              value
              option { id handle name }
              optionValue { id handle name }
            }
            featuredMedia {
              id
              ... on MediaImage { image { url } }
            }
            media(first: 20) {
              edges {
                node { id ... on MediaImage { image { url } } }
              }
            }
            price { currencyCode amount }
            compareAtPrice { currencyCode amount }
            isAvailable: availableForSale
            currentlyNotInStock
            quantityAvailable
          }
        }
      }
      tags {
        id
        handle
        title: name
      }
      features {
        id
        handle
        title: name
        position
      }
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      compareAtPriceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      availableForSale
      totalInventory
      createdAt
      updatedAt
      rating: reviewSummary {
        count: reviewCount
        rating: averageRating
        verifiedReviewCount
        mediaReviewCount
        breakdown: ratingBreakdown {
          rating1Count
          rating2Count
          rating3Count
          rating4Count
          rating5Count
        }
      }
    }
  }
`;

export { default as ProductQueryNode } from './__generated__/ProductQuery.graphql';
export type { ProductQuery as ProductQueryType } from './__generated__/ProductQuery.graphql';
