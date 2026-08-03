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
      title: `${title} | Northstar Supply`,
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
    "About Northstar",
    "Northstar Supply brings together useful, well-made goods from responsible independent makers and our own everyday essentials collection.",
    "2026-01-10T09:00:00.000Z",
    "story",
  ),
  page(
    "shipping-returns",
    "Shipping & returns",
    "Standard delivery takes three to five business days. Unused items may be returned in their original condition within 30 days of delivery.",
    "2026-01-10T09:10:00.000Z",
  ),
  page(
    "contact",
    "Contact us",
    "Our customer-care team is available Monday through Friday, 9:00–17:00 Eastern Time at support@northstar.example.",
    "2026-01-10T09:20:00.000Z",
  ),
  page(
    "size-guide",
    "Size guide",
    "Use the garment measurements on each product page and compare them with a similar item you already own for the most reliable fit.",
    "2026-01-10T09:30:00.000Z",
  ),
  page(
    "care-guide",
    "Product care",
    "Thoughtful care extends product life. Wash garments cool, air dry when possible, and follow the material-specific instructions on every product page.",
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
