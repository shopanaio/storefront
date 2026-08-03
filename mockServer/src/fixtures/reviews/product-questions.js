import { products } from "../catalog/products.js";
import { productVariants } from "../catalog/product-variants.js";
import { customers } from "../customers/customers.js";
import { contentMetrics, emptyViewerState, gid } from "../shared.js";

const definitions = [
  ["essential-cotton-tee", 0, 4, "Does this shrink in the wash?", "Should I size up if I plan to machine wash it?", true, "2026-07-29T10:30:00.000Z"],
  ["relaxed-linen-shirt", 2, null, "Is the white color transparent?", "Can it be worn without a camisole?", true, "2026-07-24T13:15:00.000Z"],
  ["commuter-backpack", 0, 2, "What laptop size fits?", "Will the padded sleeve fit a 16-inch laptop?", true, "2026-07-20T08:25:00.000Z"],
  ["stoneware-mug-set", 0, 1, "Are these dishwasher safe?", "Can the mugs go in both the dishwasher and microwave?", true, "2026-07-18T17:40:00.000Z"],
  ["portable-table-lamp", 1, 0, "How long does charging take?", "How long from empty to full with the included cable?", true, "2026-08-01T19:05:00.000Z"],
  ["studio-wireless-headphones", 0, null, "Can they connect to two devices?", "I switch between a laptop and phone during work.", true, "2026-07-31T09:50:00.000Z"],
  ["natural-rubber-yoga-mat", 1, 3, "Does it contain latex?", "I have a latex sensitivity and want to confirm the material.", false, "2026-08-02T11:35:00.000Z"],
  ["washed-linen-throw", 0, 4, "Can this be tumble dried?", "The care page says air drying is preferred, but is low heat safe?", false, "2026-08-03T07:20:00.000Z"],
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
