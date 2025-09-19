import { graphql } from "react-relay";


export const createReviewMutation = graphql`
  mutation createReviewMutation($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      rating
      title
      message
      pros
      cons
      status
      verifiedPurchase
      helpfulNo
      helpfulYes
      createdAt
      }
    }
`;