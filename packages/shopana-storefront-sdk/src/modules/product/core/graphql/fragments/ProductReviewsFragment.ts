import { graphql } from 'relay-runtime';

export const ProductReviewsFragment = graphql`
  fragment ProductReviewsFragment on Product
  @refetchable(queryName: "SDKProductReviewsPaginationQuery")
  @argumentDefinitions(
    first: { type: "Int", defaultValue: 3 }
    after: { type: "Cursor" }
    sort: { type: "ReviewSort", defaultValue: MOST_HELPFUL }
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
          kind
          rating
          title
          message: body
          locale
          author { type displayName }
          status
          revision
          verifiedPurchase: isVerifiedPurchase
          verificationStatus
          metrics {
            helpfulYes: likeCount
            helpfulNo: dislikeCount
            mediaCount
          }
          viewerEngagement {
            meHelpful: vote
            hasReported
          }
          createdAt
          editedAt: updatedAt
          publishedAt
          media {
            id
            media { id ... on MediaImage { image { url } } }
          }
        }
      }
    }
  }
`;

export { default as ProductReviewsFragmentNode } from './__generated__/ProductReviewsFragment.graphql';
export type { ProductReviewsFragment$key, ProductReviewsFragment$data } from './__generated__/ProductReviewsFragment.graphql';
