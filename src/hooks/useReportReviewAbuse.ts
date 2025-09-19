import { useMutation } from "react-relay/hooks";
import { reportReviewAbuseMutation } from "@src/relay/queries/reportReviewAbuseMutation.shopana";

export const useReportReviewAbuse = () => {
  const [commit, isInFlight] = useMutation(reportReviewAbuseMutation);

  const reportReviewAbuse = (reviewId: string, reason: string) => {
    commit({
      variables: { reviewId, reason },
    });
  };

  return { reportReviewAbuse, loading: isInFlight };
};