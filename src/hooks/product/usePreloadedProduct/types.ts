import type { model } from "@shopana/storefront-sdk/model/namespace";
import type { Reviews$key } from "@src/queries/Reviews/__generated__/Reviews.graphql";

export type UsePreloadedProductResult = {
  product: model.Product | null;
  productReviewsRef: Reviews$key | null;
};
