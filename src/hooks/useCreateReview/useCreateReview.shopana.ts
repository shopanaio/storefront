import { graphql } from "react-relay";
import { useMutation } from "react-relay/hooks";

const useCreateReviewMutation = graphql`
  mutation useCreateReviewMutation($input: ReviewCreateInput!) {
    reviewCreate(input: $input) {
      review {
        id
        rating
        title
        message: body
        locale
        status
        revision
        verifiedPurchase: isVerifiedPurchase
        verificationStatus
        author { type displayName }
        metrics {
          helpfulYes: likeCount
          helpfulNo: dislikeCount
          mediaCount
        }
        viewerEngagement { vote hasReported }
        createdAt
        updatedAt
        publishedAt
        media {
          id
          media { id ... on MediaImage { image { url } } }
        }
      }
      errors: userErrors { code field message }
    }
  }
`;

export const useCreateReview = () => {
  const [commit, isInFlight] = useMutation(useCreateReviewMutation as any);

  const createReview = (
    input: any,
    onCompleted?: (response: any, errors: any) => void,
    onError?: (error: Error) => void
  ) => {
    commit({
      variables: { input },
      onCompleted,
      onError,
    });
  };

  return { createReview, loading: isInFlight };
};

export default useCreateReview;
