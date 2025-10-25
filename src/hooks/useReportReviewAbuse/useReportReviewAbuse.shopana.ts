import { graphql } from "react-relay";
import { useMutation } from "react-relay/hooks";

const useReportReviewAbuseMutation = graphql`
  mutation useReportReviewAbuseMutation($reviewId: ID!, $reason: String!) {
    reportReviewAbuse(reviewId: $reviewId, reason: $reason)
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
