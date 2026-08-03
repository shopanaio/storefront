import { graphql } from "react-relay";
import { useMutation } from "react-relay/hooks";

const useReportReviewAbuseMutation = graphql`
  mutation useReportReviewAbuseMutation(
    $reviewId: ID!
    $reason: ReviewContentReportReason!
  ) {
    reviewContentReportCreate(
      input: { contentId: $reviewId, reason: $reason }
    ) {
      content {
        id
        viewerEngagement { vote hasReported }
      }
      report { id reason status createdAt }
      errors: userErrors { code field message }
    }
  }
`;

export const useReportReviewAbuse = () => {
  const [commit, isInFlight] = useMutation(useReportReviewAbuseMutation as any);

  const reportReviewAbuse = (reviewId: string, reason: string) => {
    commit({
      variables: { reviewId, reason },
    });
  };

  return { reportReviewAbuse, loading: isInFlight };
};

export default useReportReviewAbuse;
