import { graphql } from "react-relay";

export const voteReviewHelpfulMutation = graphql`
  mutation voteReviewHelpfulMutation($input: VoteReviewHelpfulInput!) {
    voteReviewHelpful(input: $input)}
`;