import { StorefrontUseCreateReviewMutationDocument } from '../../../codegen/apollo/storefront-operations';
import type {
  ReviewCreateInput,
  StorefrontUseCreateReviewMutation,
} from '../../../codegen/apollo/storefront-operations';
import { useMutation } from '@shopana/storefront-sdk/graphql/apollo';

const useCreateReviewMutation = StorefrontUseCreateReviewMutationDocument;

export const useCreateReview = () => {
  const [commit, isInFlight] = useMutation(useCreateReviewMutation);

  const createReview = (
    input: {
      productId: string;
      rating: number;
      message: string;
      title?: string;
      displayName?: string;
    },
    onCompleted?: (
      response: StorefrontUseCreateReviewMutation,
      errors: readonly unknown[] | null
    ) => void,
    onError?: (error: Error) => void
  ) => {
    const mutationInput: ReviewCreateInput = {
      productId: input.productId,
      rating: input.rating,
      title: input.title,
      content: {
        body: input.message,
        idempotencyKey: crypto.randomUUID(),
        ...(input.displayName
          ? { author: { displayName: input.displayName } }
          : {}),
      },
    };

    commit({
      variables: { input: mutationInput },
      onCompleted,
      onError,
      // A newly submitted review may still require moderation. Invalidate the
      // connection instead of inserting an item that the server may not expose.
      updater: (cache) => {
        const productCacheId = cache.identify({
          __typename: 'Product',
          id: input.productId,
        });
        if (productCacheId) {
          cache.evict({ id: productCacheId, fieldName: 'reviews' });
        }
      },
    });
  };

  return { createReview, loading: isInFlight };
};

export default useCreateReview;
