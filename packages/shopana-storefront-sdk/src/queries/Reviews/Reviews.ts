import { graphql } from "relay-runtime";

const Reviews = graphql`
  fragment Reviews on Product
  @refetchable(queryName: "ProductReviewsPaginationQuery")
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

export default Reviews;
