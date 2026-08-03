import { products } from "../catalog/products.js";
import { productVariants } from "../catalog/product-variants.js";
import { customers } from "../customers/customers.js";
import { gid } from "../shared.js";
import { reviews } from "./reviews.js";

const definitions = [
  [0, "studio-wireless-headphones", 0, "SUBMITTED", "2026-07-15T09:00:00.000Z", 13],
  [1, "low-profile-mechanical-keyboard", 0, "SCHEDULED", "2026-08-09T09:00:00.000Z", null],
  [2, "weatherproof-field-jacket", 2, "OPENED", "2026-08-02T09:00:00.000Z", null],
  [3, "portable-table-lamp", 2, "EXPIRED", "2026-06-25T09:00:00.000Z", null],
  [0, "market-canvas-tote", 1, "DELIVERED", "2026-04-20T09:00:00.000Z", null],
];

const eventTypesByStatus = {
  SCHEDULED: ["SCHEDULED"],
  DELIVERED: ["SCHEDULED", "SENT", "DELIVERED"],
  OPENED: ["SCHEDULED", "SENT", "DELIVERED", "OPENED"],
  SUBMITTED: ["SCHEDULED", "SENT", "DELIVERED", "OPENED", "SUBMITTED"],
  EXPIRED: ["SCHEDULED", "SENT", "DELIVERED", "EXPIRED"],
};

export const reviewRequests = definitions.map(([customerIndex, productHandle, variantIndex, status, scheduledAt, reviewIndex], index) => {
  const events = eventTypesByStatus[status].map((type, eventIndex) => ({
    id: gid("ReviewRequestEvent", `${index + 1}-${eventIndex + 1}`),
    type,
    occurredAt: new Date(Date.parse(scheduledAt) + eventIndex * 3_600_000).toISOString(),
    createdAt: new Date(Date.parse(scheduledAt) + eventIndex * 3_600_000).toISOString(),
  }));

  return {
    id: gid("ReviewRequest", index + 1),
    customerId: customers[customerIndex].id,
    productId: products.find(({ handle }) => handle === productHandle).id,
    variantId: productVariants.find(({ id }) => id === gid("ProductVariant", `${productHandle}-${variantIndex + 1}`)).id,
    reviewId: reviewIndex === null ? null : reviews[reviewIndex].id,
    channel: "EMAIL",
    status,
    locale: "en",
    attemptCount: status === "EXPIRED" ? 2 : status === "SCHEDULED" ? 0 : 1,
    scheduledAt,
    sentAt: events.find(({ type }) => type === "SENT")?.occurredAt ?? null,
    deliveredAt: events.find(({ type }) => type === "DELIVERED")?.occurredAt ?? null,
    openedAt: events.find(({ type }) => type === "OPENED")?.occurredAt ?? null,
    submittedAt: events.find(({ type }) => type === "SUBMITTED")?.occurredAt ?? null,
    expiresAt: new Date(Date.parse(scheduledAt) + 30 * 86_400_000).toISOString(),
    events,
    createdAt: scheduledAt,
    updatedAt: events.at(-1).occurredAt,
  };
});
