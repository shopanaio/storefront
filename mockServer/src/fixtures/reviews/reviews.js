import { products } from "../catalog/products.js";
import { productVariants } from "../catalog/product-variants.js";
import { customers } from "../customers/customers.js";
import { contentMetrics, emptyViewerState, gid } from "../shared.js";
import { reviewRatingCriteria } from "./rating-criteria.js";

const reviewDefinitions = [
  ["essential-cotton-tee", 1, 0, 5, "The tee I was looking for", "Substantial fabric, clean neckline, and it held its shape after washing.", true, 18, "2026-07-25T14:10:00.000Z"],
  ["essential-cotton-tee", 0, null, 4, "Great weight", "Feels much better made than a typical basic tee. The fit is slightly boxy.", false, 7, "2026-07-12T09:30:00.000Z"],
  ["relaxed-linen-shirt", 2, 1, 5, "Perfect relaxed fit", "Airy without being sheer, and the sleeves roll up neatly.", true, 12, "2026-07-28T16:45:00.000Z"],
  ["weekend-knit-cardigan", 1, 3, 4, "Soft and warm", "Lovely texture and color. I would prefer slightly deeper pockets.", true, 5, "2026-06-18T11:05:00.000Z"],
  ["classic-oxford-shirt", 2, null, 5, "A dependable shirt", "Comfortable through a full workday and easy to dress down on weekends.", false, 9, "2026-07-20T12:00:00.000Z"],
  ["selvedge-denim-jacket", 1, 2, 4, "Built to last", "Stiff on day one but already breaking in nicely. Sizing is accurate.", true, 14, "2026-06-29T18:20:00.000Z"],
  ["leather-crossbody-bag", 0, 0, 5, "Beautiful leather", "Compact but fits my phone, wallet, sunglasses, and keys with room to spare.", true, 21, "2026-07-30T10:15:00.000Z"],
  ["commuter-backpack", 0, 2, 5, "Excellent for train travel", "The laptop compartment is padded well and the bag stays comfortable when full.", true, 16, "2026-07-22T08:40:00.000Z"],
  ["minimalist-field-watch", 1, null, 4, "Simple and readable", "The dial is very clear and the nylon strap is comfortable in warm weather.", false, 4, "2026-05-17T13:25:00.000Z"],
  ["stoneware-mug-set", 0, 1, 5, "Every mug feels unique", "The glaze variation is subtle and they are a comfortable size for coffee.", true, 11, "2026-07-09T15:55:00.000Z"],
  ["washed-linen-throw", 1, 3, 4, "Great color and texture", "The rust color is rich and the throw softened noticeably after one wash.", true, 8, "2026-06-24T20:10:00.000Z"],
  ["portable-table-lamp", 0, 0, 5, "We use it every evening", "Warm light, smooth dimming, and the battery easily lasts through dinner outside.", true, 27, "2026-07-31T19:30:00.000Z"],
  ["cedar-amber-candle", 0, null, 3, "Nice but subtle", "Clean scent and burn, though the fragrance is lighter than I expected.", false, 2, "2026-07-03T17:00:00.000Z"],
  ["studio-wireless-headphones", 0, 0, 5, "Quiet commute at last", "Noise cancellation is excellent and the ear cups remain comfortable after two hours.", true, 34, "2026-07-18T07:50:00.000Z"],
  ["mini-bluetooth-speaker", 0, 1, 4, "Small speaker, clear sound", "Vocals sound crisp and it is easy to carry from room to room.", true, 6, "2026-06-11T14:35:00.000Z"],
  ["low-profile-mechanical-keyboard", 0, 1, 5, "Excellent daily keyboard", "The tactile feel is satisfying without being too loud for a shared office.", true, 19, "2026-07-26T09:05:00.000Z"],
  ["natural-rubber-yoga-mat", 1, null, 4, "Very grippy", "Stable even during a warm class. It is heavier than a travel mat, as expected.", false, 5, "2026-07-14T18:45:00.000Z"],
  ["packable-picnic-blanket", 0, 2, 5, "Lives in the car now", "Large enough for four people and damp grass does not come through.", true, 10, "2026-06-30T12:20:00.000Z"],
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
