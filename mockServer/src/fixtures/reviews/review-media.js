import { gid } from "../shared.js";
import { reviews } from "./reviews.js";

const definitions = [
  [2, "Chicken in gravy served for breakfast"],
  [6, "Leather texture after two weeks of use"],
  [11, "Lamp at the lowest warm-light setting"],
  [13, "Headphones and included travel case"],
  [18, "Empty bowl after the first serving"],
  [19, "Wet food portion ready to serve"],
  [20, "Senior cat enjoying the gravy texture"],
  [21, "Picky cat waiting at mealtime"],
  [22, "Fresh pouch consistency close-up"],
  [23, "Single wet food portion in a clean bowl"],
  [24, "Soft pieces and gravy consistency"],
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
