import { gid } from "../shared.js";
import { reviews } from "./reviews.js";

const definitions = [
  [6, "Leather texture after two weeks of use"],
  [11, "Lamp at the lowest warm-light setting"],
  [13, "Headphones and included travel case"],
];

export const reviewMedia = definitions.map(([reviewIndex, caption]) => {
  const review = reviews[reviewIndex];
  return {
    id: gid("ReviewMedia", reviewIndex + 1),
    reviewId: review.id,
    mediaId: gid("MediaImage", `review-${reviewIndex + 1}`),
    sortIndex: 0,
    caption,
    status: "PUBLISHED",
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
});
