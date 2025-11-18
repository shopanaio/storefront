import type { Entity } from "@shopana/entity";
import type { Reviews$key } from "@src/queries/Reviews/__generated__/Reviews.graphql";

export type UsePreloadedProductResult = {
  product: Entity.Product | null;
  productReviewsRef: Reviews$key | null;
};
