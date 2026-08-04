import type { model } from '@shopana/storefront-sdk';
import type { ReviewsData } from '@shopana/storefront-sdk/queries/Reviews';

export type UsePreloadedProductResult = {
  product: model.Product | null;
  productReviewsRef: ReviewsData | null;
};
