import { products } from "../catalog/products.js";
import { productVariants } from "../catalog/product-variants.js";
import { customers } from "../customers/customers.js";
import { contentMetrics, emptyViewerState, gid } from "../shared.js";

const definitions = [
  ["salmon-dog-kibble", 0, 4, "Is this suitable for sensitive stomachs?", "My dog does best with fish-based food. How gradual should the transition be?", true, "2026-07-29T10:30:00.000Z"],
  ["chicken-cat-kibble", 2, null, "Is this recipe suitable for senior cats?", "My indoor cat is eleven and less active than she used to be.", true, "2026-07-24T13:15:00.000Z"],
  ["pet-travel-carrier", 0, 2, "Will it fit under an airline seat?", "Is the carrier accepted as an in-cabin size by most airlines?", true, "2026-07-20T08:25:00.000Z"],
  ["ceramic-pet-bowl-set", 0, 1, "Are these dishwasher safe?", "Can both bowls go in the dishwasher every day?", true, "2026-07-18T17:40:00.000Z"],
  ["smart-pet-feeder", 1, 0, "Does it work during a power outage?", "Will scheduled meals continue if Wi-Fi or mains power is interrupted?", true, "2026-08-01T19:05:00.000Z"],
  ["gps-pet-tracker", 0, null, "How accurate is live tracking?", "I want to use it when hiking with my dog in wooded areas.", true, "2026-07-31T09:50:00.000Z"],
  ["silicone-lick-mat", 1, 3, "Can this go in the freezer?", "I would like to freeze wet food on it for longer enrichment.", false, "2026-08-02T11:35:00.000Z"],
  ["washable-pet-blanket", 0, 4, "Can this be tumble dried?", "Is low heat safe after a muddy walk?", false, "2026-08-03T07:20:00.000Z"],
];

export const productQuestions = definitions.map(([productHandle, variantIndex, customerIndex, title, body, answered, createdAt], index) => {
  const customer = customerIndex === null ? null : customers[customerIndex];
  return {
    id: gid("ProductQuestion", index + 1),
    kind: "PRODUCT_QUESTION",
    title,
    body,
    locale: "en",
    author: {
      type: customer ? "CUSTOMER" : "GUEST",
      customerId: customer?.id ?? null,
      displayName: customer?.displayName ?? "Store visitor",
    },
    status: "PUBLISHED",
    revision: 1,
    publishedAt: createdAt,
    createdAt,
    updatedAt: createdAt,
    metrics: contentMetrics({
      likeCount: index % 4,
      childCount: answered ? 1 : 0,
      officialChildCount: answered ? 1 : 0,
      acceptedChildCount: answered ? 1 : 0,
      lastChildAt: answered ? new Date(Date.parse(createdAt) + 43_200_000).toISOString() : null,
    }),
    translations: [],
    ...emptyViewerState,
    productId: products.find(({ handle }) => handle === productHandle).id,
    variantId: productVariants.find(({ id }) => id === gid("ProductVariant", `${productHandle}-${variantIndex + 1}`)).id,
    answerIds: answered ? [gid("ProductQuestionAnswer", index + 1)] : [],
    viewerSubscription: null,
  };
});
