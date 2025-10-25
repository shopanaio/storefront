import { graphql } from "relay-runtime";

const Reviews = graphql`
  fragment Reviews on Product
  @refetchable(queryName: "ProductReviewsPaginationQuery")
  @argumentDefinitions(
    first: { type: "Int", defaultValue: 3 }
    after: { type: "Cursor" }
    sort: { type: "ProductReviewSort", defaultValue: CREATED_AT_DESC }
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

export default Reviews;

