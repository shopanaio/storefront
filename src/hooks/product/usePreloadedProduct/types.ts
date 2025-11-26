import type { model } from "@shopana/storefront-sdk";
import type { Reviews$key } from "@shopana/storefront-sdk/queries/Reviews";

export type UsePreloadedProductResult = {
  product: model.Product | null;
  productReviewsRef: Reviews$key | null;
};
