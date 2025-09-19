import { useMutation } from "react-relay/hooks";
import { voteReviewHelpfulMutation } from "@src/relay/queries/voteReviewHelpfulMutation.shopana";
import {
  VoteReviewHelpfulInput,
  voteReviewHelpfulMutation as VoteReviewHelpfulMutationType,
} from "@src/relay/queries/__generated__/voteReviewHelpfulMutation.graphql";
import { PayloadError } from "relay-runtime";

export const useVoteReviewHelpful = () => {
  const [commit, isInFlight] = useMutation<VoteReviewHelpfulMutationType>(voteReviewHelpfulMutation);

  const voteReviewHelpful = (
    input: VoteReviewHelpfulInput,
    onCompleted?: (response: VoteReviewHelpfulMutationType["response"], errors: PayloadError[] | null) => void,
    onError?: (error: Error) => void
  ) => {
    commit({
      variables: { input },
      onCompleted: (response, errors) => {
        if (onCompleted) onCompleted(response, errors);
      },
      onError,
    });
  };

  return { voteReviewHelpful, loading: isInFlight };
};