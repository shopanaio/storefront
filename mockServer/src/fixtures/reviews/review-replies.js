import { contentMetrics, emptyViewerState, gid } from "../shared.js";
import { reviews } from "./reviews.js";

const definitions = [
  [0, "Thank you, Alex. We are glad your dog is enjoying the salmon recipe and the transition went smoothly."],
  [2, "Thank you for sharing breakfast photos. We are delighted that both cats took to the recipe so quickly."],
  [6, "Thanks for the thoughtful review. The vegetable-tanned leather will soften further and develop a rich patina with walks."],
  [11, "We love hearing that the feeder is keeping mealtimes dependable. Thank you for sharing."],
  [12, "Thank you for the feedback. We designed the pet-safe fragrance to stay gentle, and we appreciate your note on odor control."],
  [18, "We are so pleased the recipe has been gentle on a sensitive stomach. Thank you for documenting the first serving."],
  [20, "Thank you for the detailed senior-cat feedback. The soft texture and added moisture are exactly what we hoped would help."],
  [23, "We appreciate the portion-size note and the photos. A clean bowl is wonderful feedback for our kitchen team."],
  [25, "Thank you for sharing such a clear texture close-up. We are glad the aroma and consistency were a hit."],
  [26, "Winning over two cats at once is high praise. Thank you for making us part of their dinner routine."],
  [28, "We love hearing that the recipe is comfortable for your senior cat. Thank you for the helpful serving tip."],
  [29, "A settled stomach and glossy coat are wonderful results. Thank you for staying with the recipe for a full month."],
  [31, "Three weeks of clean breakfast bowls made our day. Thank you for the lovely photo set."],
  [33, "Flavor rotation can make meals much more engaging. We are happy the chicken recipe earned a regular place."],
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
