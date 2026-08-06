import { contentMetrics, emptyViewerState, gid } from "../shared.js";
import { reviews } from "./reviews.js";

const definitions = [
  [0, "Thank you, Alex. We are glad your dog is enjoying the salmon recipe and the transition went smoothly."],
  [6, "Thanks for the thoughtful review. The vegetable-tanned leather will soften further and develop a rich patina with walks."],
  [11, "We love hearing that the feeder is keeping mealtimes dependable. Thank you for sharing."],
  [12, "Thank you for the feedback. We designed the pet-safe fragrance to stay gentle, and we appreciate your note on odor control."],
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
    author: { type: "SELLER", customerId: null, displayName: "Paw & Whisker" },
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
