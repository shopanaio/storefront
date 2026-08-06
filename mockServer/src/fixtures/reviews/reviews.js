import { products } from "../catalog/products.js";
import { productVariants } from "../catalog/product-variants.js";
import { customers } from "../customers/customers.js";
import { contentMetrics, emptyViewerState, gid } from "../shared.js";
import { reviewRatingCriteria } from "./rating-criteria.js";

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
];

export const reviews = reviewDefinitions.map((definition, index) => {
  const [productHandle, variantIndex, customerIndex, rating, title, body, verified, likes, createdAt] = definition;
  const product = products.find(({ handle }) => handle === productHandle);
  const variant = productVariants.find(({ id }) => id === gid("ProductVariant", `${productHandle}-${variantIndex + 1}`));
  const customer = customerIndex === null ? null : customers[customerIndex];
  const id = gid("Review", index + 1);
  const hasOfficialReply = [0, 6, 11, 12].includes(index);
  const hasMedia = [6, 11, 13].includes(index);

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
      mediaCount: hasMedia ? 1 : 0,
      childCount: hasOfficialReply ? 1 : 0,
      officialChildCount: hasOfficialReply ? 1 : 0,
      lastChildAt: hasOfficialReply ? new Date(Date.parse(createdAt) + 86_400_000).toISOString() : null,
    }),
    translations: [],
    ...emptyViewerState,
    productId: product.id,
    variantId: variant.id,
    rating,
    ratings: reviewRatingCriteria.slice(0, 2).map((criterion, criterionIndex) => ({
      criterionId: criterion.id,
      value: Math.max(1, rating - (criterionIndex === 1 && index % 4 === 0 ? 1 : 0)),
      createdAt,
      updatedAt: createdAt,
    })),
    verificationStatus: verified ? "VERIFIED" : "UNVERIFIED",
    isVerifiedPurchase: verified,
    isIncentivized: false,
    incentiveDisclosure: null,
    mediaIds: hasMedia ? [gid("ReviewMedia", index + 1)] : [],
    replyIds: hasOfficialReply ? [gid("ReviewReply", index + 1)] : [],
  };
});
