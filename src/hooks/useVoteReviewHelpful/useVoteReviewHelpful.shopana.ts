import { graphql } from "react-relay";
import { useMutation } from "react-relay/hooks";

const useVoteReviewHelpfulMutation = graphql`
  mutation useVoteReviewHelpfulMutation($input: ReviewContentVoteSetInput!) {
    reviewContentVoteSet(input: $input) {
      content {
        id
        metrics { likeCount dislikeCount }
        viewerEngagement { vote hasReported }
      }
      vote { id type }
      errors: userErrors { code field message }
    }
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
