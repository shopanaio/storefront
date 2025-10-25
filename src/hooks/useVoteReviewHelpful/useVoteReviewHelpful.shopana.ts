import { graphql } from "react-relay";
import { useMutation } from "react-relay/hooks";

const useVoteReviewHelpfulMutation = graphql`
  mutation useVoteReviewHelpfulMutation($input: VoteReviewHelpfulInput!) {
    voteReviewHelpful(input: $input)
  }
`;

export const useVoteReviewHelpful = () => {
  const [commit, isInFlight] = useMutation(useVoteReviewHelpfulMutation as any);

  const voteReviewHelpful = (
    input: { reviewId: string; helpful: boolean },
    onCompleted?: (response: any, errors: any) => void,
    onError?: (error: Error) => void
  ) => {
    commit({
      variables: { input },
      onCompleted,
      onError,
    });
  };

  return { voteReviewHelpful, loading: isInFlight };
};

export default useVoteReviewHelpful;
