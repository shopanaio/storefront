import { products } from "../catalog/products.js";
import { productVariants } from "../catalog/product-variants.js";
import { customers } from "../customers/customers.js";
import { contentMetrics, emptyViewerState, gid } from "../shared.js";
import { reviewRatingCriteria } from "./rating-criteria.js";
import { reviewMediaDefinitions } from "./review-media-definitions.js";

const reviewDefinitions = [
  ["salmon-dog-kibble", 1, 0, 5, "My dog cleans the bowl", "The kibble size is just right and the gradual transition was easy on his stomach.", true, 18, "2026-07-25T14:10:00.000Z"],
  ["salmon-dog-kibble", 0, null, 4, "Great ingredients", "My picky terrier likes it, and the resealable bag keeps the food fresh.", false, 7, "2026-07-12T09:30:00.000Z"],
  ["chicken-cat-kibble", 2, 1, 5, "A hit with both cats", "They switched over without fuss and seem satisfied between meals.", true, 12, "2026-07-28T16:45:00.000Z"],
  ["calming-dog-bed", 1, 3, 4, "Soft and comforting", "My rescue curled up immediately. I would love an extra replacement cover.", true, 5, "2026-06-18T11:05:00.000Z"],
  ["dental-dog-chews", 2, null, 5, "An easy daily routine", "My dog treats dental time like a reward and his breath is noticeably fresher.", false, 9, "2026-07-20T12:00:00.000Z"],
  ["dog-raincoat", 1, 2, 4, "Keeps the mud off", "The reflective trim is excellent and the medium fits my spaniel well.", true, 14, "2026-06-29T18:20:00.000Z"],
  ["leather-dog-collar", 0, 0, 5, "Beautiful leather", "Soft from the first walk, sturdy hardware, and the cognac color looks wonderful.", true, 21, "2026-07-30T10:15:00.000Z"],
  ["pet-travel-carrier", 0, 2, 5, "Excellent for train travel", "The base is supportive and my cat stayed calm with plenty of airflow.", true, 16, "2026-07-22T08:40:00.000Z"],
  ["retractable-dog-leash", 1, null, 4, "Smooth and comfortable", "The brake responds quickly and the grip stays comfortable on long walks.", false, 4, "2026-05-17T13:25:00.000Z"],
  ["ceramic-pet-bowl-set", 0, 1, 5, "Stays put at mealtime", "The bowls have a reassuring weight and clean up beautifully in the dishwasher.", true, 11, "2026-07-09T15:55:00.000Z"],
  ["washable-pet-blanket", 1, 3, 4, "Great color and texture", "The rust color hides paw marks well and it came out soft after washing.", true, 8, "2026-06-24T20:10:00.000Z"],
  ["smart-pet-feeder", 0, 0, 5, "Reliable meal schedule", "Portions dispense on time and the app alerts are reassuring when I work late.", true, 27, "2026-07-31T19:30:00.000Z"],
  ["odor-neutralizing-candle", 0, null, 3, "Pleasant but subtle", "The scent is gentle around our pets, though I expected stronger odor control.", false, 2, "2026-07-03T17:00:00.000Z"],
  ["gps-pet-tracker", 0, 0, 5, "Peace of mind on every walk", "Safe-zone alerts are fast and the battery comfortably lasts several days.", true, 34, "2026-07-18T07:50:00.000Z"],
  ["interactive-treat-camera", 0, 1, 4, "Clear video and fun treats", "The picture is sharp and my dog learned the treat sound in one afternoon.", true, 6, "2026-06-11T14:35:00.000Z"],
  ["self-cleaning-litter-box", 0, 1, 5, "A huge daily time-saver", "It runs quietly, controls odor well, and both cats adjusted within a week.", true, 19, "2026-07-26T09:05:00.000Z"],
  ["silicone-lick-mat", 1, null, 4, "Great calming activity", "It grips the tile well and keeps my dog occupied during grooming.", false, 5, "2026-07-14T18:45:00.000Z"],
  ["waterproof-car-seat-cover", 0, 2, 5, "Lives in the car now", "It covers the full back seat and muddy water wipes away easily.", true, 10, "2026-06-30T12:20:00.000Z"],
  ["chicken-cat-kibble", 0, 0, 5, "Gentle on a sensitive stomach", "The gravy texture is easy to serve, and my cat has had no digestive issues since switching.", true, 24, "2026-08-01T10:20:00.000Z", { digestibility: 3 }],
  ["chicken-cat-kibble", 1, 1, 5, "Clean bowl every time", "Good ingredients, plenty of moisture, and a soft consistency my senior cat can manage.", true, 17, "2026-07-31T12:40:00.000Z", { ingredients: 3 }],
  ["chicken-cat-kibble", 2, 2, 4, "Great everyday wet food", "The portions are convenient and the nutritional balance works well for our two cats.", true, 11, "2026-07-29T08:15:00.000Z", { "nutritional-value": 3 }],
  ["chicken-cat-kibble", 3, null, 5, "Picky-cat approved", "Smooth pieces in gravy with a fresh smell. Even our picky cat comes running at mealtime.", false, 8, "2026-07-27T17:05:00.000Z", { "texture-consistency": 3 }],
  ["chicken-cat-kibble", 0, 3, 4, "Nice texture and easy portions", "The pouch opens cleanly and the texture stays consistent from one serving to the next.", true, 13, "2026-07-23T19:25:00.000Z"],
  ["chicken-cat-kibble", 1, 0, 5, "Perfect portion for one meal", "The pouch is a convenient size, smells fresh, and leaves no leftovers in the bowl.", true, 15, "2026-07-21T11:35:00.000Z"],
  ["chicken-cat-kibble", 2, 2, 4, "Good moisture and consistency", "There is plenty of gravy and the pieces stay soft without turning into paste.", true, 9, "2026-07-19T14:50:00.000Z"],
  ["chicken-cat-kibble", 3, 4, 5, "Even better than expected", "The aroma got an immediate response, and the soft pieces were easy for my cat to finish.", true, 20, "2026-07-17T09:10:00.000Z"],
  ["chicken-cat-kibble", 0, 1, 5, "Both cats agree on dinner", "It is rare for both cats to enjoy the same recipe, but every bowl has been completely clean.", true, 22, "2026-07-15T18:30:00.000Z"],
  ["chicken-cat-kibble", 1, null, 4, "Convenient for weekends away", "The pouches travel well and make it simple to keep portions consistent away from home.", false, 6, "2026-07-13T12:25:00.000Z"],
  ["chicken-cat-kibble", 2, 3, 5, "Easy for my older cat", "I can mash the pieces with a fork, and the extra gravy helps my senior cat eat comfortably.", true, 18, "2026-07-11T07:45:00.000Z"],
  ["chicken-cat-kibble", 3, 0, 5, "Healthy coat and steady appetite", "After a month her coat looks glossy, her digestion is settled, and she still gets excited for every meal.", true, 29, "2026-07-08T16:20:00.000Z"],
  ["chicken-cat-kibble", 0, null, 4, "Clear feeding guide", "The package guidance made portions easy to calculate, though I would like a larger multipack.", false, 7, "2026-07-06T10:05:00.000Z"],
  ["chicken-cat-kibble", 1, 2, 5, "Reliable breakfast favorite", "We have served it every morning for three weeks and enthusiasm has not faded at all.", true, 16, "2026-07-04T08:35:00.000Z"],
  ["chicken-cat-kibble", 2, 4, 4, "Smooth transition from dry food", "Mixing a little more each day worked perfectly and there was no stomach upset during the change.", true, 12, "2026-07-02T14:15:00.000Z"],
  ["chicken-cat-kibble", 3, 1, 5, "Great for flavor rotation", "This chicken pouch works nicely in our weekly rotation and keeps our cat interested in mealtimes.", true, 19, "2026-06-28T19:40:00.000Z"],
];

const mediaCountByReviewIndex = new Map(reviewMediaDefinitions.map(([reviewIndex, captions]) => [reviewIndex, captions.length]));

export const reviews = reviewDefinitions.map((definition, index) => {
  const [productHandle, variantIndex, customerIndex, rating, title, body, verified, likes, createdAt, criterionRatings = {}] = definition;
  const product = products.find(({ handle }) => handle === productHandle);
  const variant = productVariants.find(({ id }) => id === gid("ProductVariant", `${productHandle}-${variantIndex + 1}`));
  const customer = customerIndex === null ? null : customers[customerIndex];
  const id = gid("Review", index + 1);
  const hasOfficialReply = [0, 2, 6, 11, 12, 18, 20, 23, 25, 26, 28, 29, 31, 33].includes(index);
  const mediaCount = mediaCountByReviewIndex.get(index) ?? 0;
  const applicableCriteria = reviewRatingCriteria.filter((criterion) => criterion.appliesToAllProducts || criterion.assignments.some(({ targetId, targetType }) => (targetType === "PRODUCT" ? targetId === product.id : product.categoryIds.includes(targetId))));

  return {
    id,
    kind: "REVIEW",
    title,
    body,
    locale: "en",
    author: {
      type: customer ? "CUSTOMER" : "GUEST",
      customerId: customer?.id ?? null,
      displayName: customer?.displayName ?? ["Jordan", "Riley", "Avery", "Drew"][index % 4],
    },
    status: "PUBLISHED",
    revision: 1,
    publishedAt: createdAt,
    createdAt,
    updatedAt: createdAt,
    metrics: contentMetrics({
      likeCount: likes,
      dislikeCount: index % 6 === 0 ? 1 : 0,
      mediaCount,
      childCount: hasOfficialReply ? 1 : 0,
      officialChildCount: hasOfficialReply ? 1 : 0,
      lastChildAt: hasOfficialReply ? new Date(Date.parse(createdAt) + 86_400_000).toISOString() : null,
    }),
    translations: [],
    ...emptyViewerState,
    productId: product.id,
    variantId: variant.id,
    rating,
    ratings: applicableCriteria.map((criterion, criterionIndex) => ({
      criterionId: criterion.id,
      value: criterionRatings[criterion.code] ?? Math.max(1, rating - (criterionIndex === 1 && index % 4 === 0 ? 1 : 0)),
      createdAt,
      updatedAt: createdAt,
    })),
    verificationStatus: verified ? "VERIFIED" : "UNVERIFIED",
    isVerifiedPurchase: verified,
    isIncentivized: false,
    incentiveDisclosure: null,
    mediaIds: Array.from({ length: mediaCount }, (_, mediaIndex) => gid("ReviewMedia", `${index + 1}-${mediaIndex + 1}`)),
    replyIds: hasOfficialReply ? [gid("ReviewReply", index + 1)] : [],
  };
});
