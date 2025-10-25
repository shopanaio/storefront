import { graphql } from "react-relay";
import { useMutation } from "react-relay/hooks";

const useCreateReviewMutation = graphql`
  mutation useCreateReviewMutation($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      rating
      title
      message
      pros
      cons
      status
      verifiedPurchase
      helpfulNo
      helpfulYes
      createdAt
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
