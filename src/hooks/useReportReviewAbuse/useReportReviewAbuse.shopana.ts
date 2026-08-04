import { StorefrontUseReportReviewAbuseMutationDocument } from '../../../codegen/apollo/storefront-operations';
import type { ReviewContentReportReason } from '../../../codegen/apollo/storefront-operations';
import { useMutation } from '@shopana/storefront-sdk/graphql/apollo';

const useReportReviewAbuseMutation =
  StorefrontUseReportReviewAbuseMutationDocument;

export const useReportReviewAbuse = () => {
  const [commit, isInFlight] = useMutation(useReportReviewAbuseMutation);

  const reportReviewAbuse = (
    reviewId: string,
    details: string,
    reason: ReviewContentReportReason = 'OTHER'
  ) => {
    commit({
      // The returned content carries id and viewerEngagement; normalized cache
      // replacement updates every rendered reference to the review.
      variables: { reviewId, reason, details },
    });
  };

  return { reportReviewAbuse, loading: isInFlight };
};

export default useReportReviewAbuse;
