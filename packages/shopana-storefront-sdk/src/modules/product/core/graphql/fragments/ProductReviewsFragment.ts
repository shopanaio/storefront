import { graphql } from 'relay-runtime';

export const ProductReviewsFragment = graphql`
  fragment ProductReviewsFragment on Product
  @refetchable(queryName: "ProductReviewsPaginationQuery")
  @argumentDefinitions(
    first: { type: "Int", defaultValue: 3 }
    after: { type: "Cursor" }
    sort: { type: "ProductReviewSort", defaultValue: HELPFUL_YES_DESC }
  ) {
    reviews(first: $first, after: $after, sort: $sort)
      @connection(key: "ProductReviewsFragment_reviews") {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          id
          rating
          title
          message
          displayName
          pros
          cons
          verifiedPurchase
          helpfulNo
          helpfulYes
          meHelpful
          createdAt
          editedAt
        }
      }
    }
  }
`;

export { default as ProductReviewsFragmentNode } from './__generated__/ProductReviewsFragment.graphql';
export type { ProductReviewsFragment$key, ProductReviewsFragment$data } from './__generated__/ProductReviewsFragment.graphql';
