import { gid, richText } from "../shared.js";

const page = (handle, title, body, publishedAt, templateSuffix = null) => ({
  id: gid("OnlineStorePage", handle),
  handle,
  templateSuffix,
  publishedAt,
  content: {
    locale: "en",
    title,
    body: richText(body),
    seo: {
      title: `${title} | Paw & Whisker`,
      description: body,
      openGraph: {
        title,
        description: body,
        imageId: gid("MediaImage", "brand-cover"),
      },
    },
  },
});

export const pages = [
  page(
    "about",
    "About Paw & Whisker",
    "Paw & Whisker brings together trusted nutrition, enriching toys, comfortable gear, and practical care essentials for pets and their people.",
    "2026-01-10T09:00:00.000Z",
    "story",
  ),
  page(
    "shipping-returns",
    "Shipping & returns",
    "Standard delivery takes three to five business days. Unopened food and unused pet gear may be returned in their original condition within 30 days of delivery.",
    "2026-01-10T09:10:00.000Z",
  ),
  page(
    "contact",
    "Contact us",
    "Our pet-care team is available Monday through Friday, 9:00–17:00 Eastern Time at care@pawandwhisker.example.",
    "2026-01-10T09:20:00.000Z",
  ),
  page(
    "size-guide",
    "Pet size guide",
    "Measure your pet’s neck, chest, back length, and weight, then compare those measurements with the chart on each collar, harness, bed, or carrier page.",
    "2026-01-10T09:30:00.000Z",
  ),
  page(
    "care-guide",
    "Pet care guide",
    "Introduce new food gradually, wash bowls daily, inspect walking gear regularly, and follow the product-specific safety and cleaning instructions on every page.",
    "2026-01-10T09:40:00.000Z",
  ),
  page(
    "privacy",
    "Privacy policy",
    "This demo policy describes the categories of account and order information a storefront may process. It is sample content and is not legal advice.",
    "2026-01-10T09:50:00.000Z",
    "legal",
  ),
  page(
    "terms",
    "Terms of service",
    "These demo terms cover sample storefront purchases, payment, delivery, and acceptable use. They are placeholder content for development only.",
    "2026-01-10T10:00:00.000Z",
    "legal",
  ),
];
