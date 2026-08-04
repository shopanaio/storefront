import { StorefrontUseVoteReviewHelpfulMutationDocument } from '../../../codegen/apollo/storefront-operations';
import type { StorefrontUseVoteReviewHelpfulMutation } from '../../../codegen/apollo/storefront-operations';
import { useMutation } from '@shopana/storefront-sdk/graphql/apollo';

const useVoteReviewHelpfulMutation =
  StorefrontUseVoteReviewHelpfulMutationDocument;

export const useVoteReviewHelpful = () => {
  const [commit, isInFlight] = useMutation(useVoteReviewHelpfulMutation);

  const voteReviewHelpful = (
    input: { reviewId: string; helpful: boolean },
    onCompleted?: (
      response: StorefrontUseVoteReviewHelpfulMutation,
      errors: readonly unknown[] | null
    ) => void,
    onError?: (error: Error) => void
  ) => {
    commit({
      // The mutation returns the Review id plus metrics/viewerEngagement, so
      // Apollo updates the normalized Review entity without a manual updater.
      variables: {
        input: {
          contentId: input.reviewId,
          type: input.helpful ? 'LIKE' : 'DISLIKE',
        },
      },
      onCompleted,
      onError,
    });
  };

  return { voteReviewHelpful, loading: isInFlight };
};

export default useVoteReviewHelpful;
