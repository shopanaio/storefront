import { gid } from "../shared.js";
import { reviews } from "./reviews.js";
import { reviewMediaDefinitions } from "./review-media-definitions.js";

export const reviewMedia = reviewMediaDefinitions.flatMap(([reviewIndex, captions]) => {
  const review = reviews[reviewIndex];
  return captions.map((caption, mediaIndex) => ({
    id: gid("ReviewMedia", `${reviewIndex + 1}-${mediaIndex + 1}`),
    reviewId: review.id,
    mediaId: gid("MediaImage", `review-${reviewIndex + 1}-${mediaIndex + 1}`),
    sortIndex: mediaIndex,
    caption,
    status: "PUBLISHED",
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  }));
});
