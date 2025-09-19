import { graphql } from "react-relay";

export const reportReviewAbuseMutation = graphql`
  mutation reportReviewAbuseMutation($reviewId: ID!, $reason: String!) {
    reportReviewAbuse(reviewId: $reviewId, reason: $reason)
  }
`;