import { useMutation } from "react-relay/hooks";
import { createReviewMutation } from "@src/relay/queries/createReviewMutation.shopana";
import { CreateReviewInput, createReviewMutation$data } from "@src/relay/queries/__generated__/createReviewMutation.graphql";
import { PayloadError } from "relay-runtime";

export const useCreateReview = () => {
  const [commit, isInFlight] = useMutation(createReviewMutation);

  const createReview = (
    input: CreateReviewInput,
    onCompleted?: (response: createReviewMutation$data, errors: PayloadError[] | null) => void,
    onError?: (error: Error) => void
  ) => {
    commit({
      variables: { input },
      onCompleted: (response: unknown, errors: PayloadError[] | null) => {
        if (onCompleted) {
          onCompleted(response as createReviewMutation$data, errors);
        }
      },
      onError,
    });
  };

  return { createReview, loading: isInFlight };
};