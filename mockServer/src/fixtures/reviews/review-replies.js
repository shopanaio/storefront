import { contentMetrics, emptyViewerState, gid } from "../shared.js";
import { reviews } from "./reviews.js";

const definitions = [
  [0, "Thank you, Alex. We are glad the fabric and shape are working well for you."],
  [6, "Thanks for the thoughtful review. Vegetable-tanned leather will develop an even richer patina with use."],
  [11, "We love hearing that the lamp has become part of your evenings. Thank you for sharing."],
  [12, "Thank you for the feedback. For a stronger scent throw, we recommend the 12 oz size in a smaller room."],
];

export const reviewReplies = definitions.map(([reviewIndex, body], index) => {
  const review = reviews[reviewIndex];
  const createdAt = new Date(Date.parse(review.createdAt) + 86_400_000).toISOString();
  return {
    id: gid("ReviewReply", reviewIndex + 1),
    kind: "REVIEW_REPLY",
    title: null,
    body,
    locale: "en",
    author: { type: "SELLER", customerId: null, displayName: "Northstar Supply" },
    status: "PUBLISHED",
    revision: 1,
    publishedAt: createdAt,
    createdAt,
    updatedAt: createdAt,
    metrics: contentMetrics({ likeCount: index + 1 }),
    translations: [],
    ...emptyViewerState,
    reviewId: review.id,
    isOfficial: true,
    sortIndex: 0,
  };
});
