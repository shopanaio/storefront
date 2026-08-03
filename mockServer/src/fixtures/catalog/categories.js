import { FIXTURE_NOW, gid, richText } from "../shared.js";

export const categoryDefinitions = [
  ["new-arrivals", "New arrivals", null, "The latest additions to the Northstar collection."],
  ["women", "Women", null, "Modern wardrobe essentials designed for everyday life."],
  ["women-clothing", "Women’s clothing", "women", "Comfortable layers and elevated basics."],
  ["men", "Men", null, "Versatile menswear made for work, weekends, and travel."],
  ["men-clothing", "Men’s clothing", "men", "Reliable shirts, outerwear, and everyday staples."],
  ["accessories", "Accessories", null, "Finishing touches and practical carry goods."],
  ["bags", "Bags", "accessories", "Totes, backpacks, and crossbody bags for daily use."],
  ["jewelry", "Jewelry & watches", "accessories", "Minimal jewelry and timepieces."],
  ["home-living", "Home & living", null, "Useful, beautiful objects for comfortable spaces."],
  ["kitchen-dining", "Kitchen & dining", "home-living", "Tableware and tools for the everyday kitchen."],
  ["decor", "Décor", "home-living", "Warm lighting, textiles, and accents for every room."],
  ["electronics", "Electronics", null, "Thoughtful technology for home, work, and travel."],
  ["audio", "Audio", "electronics", "Headphones and speakers with clear, balanced sound."],
  ["workspace", "Workspace", "electronics", "Tools that make a desk calmer and more productive."],
  ["outdoors", "Outdoors", null, "Durable essentials for movement and weekends away."],
  ["sale", "Sale", null, "Last-chance favorites at reduced prices."],
];

const publishedAt = "2026-01-10T09:00:00.000Z";

export const categories = categoryDefinitions.map(([handle, name, parentHandle, summary]) => ({
  id: gid("Category", handle),
  handle,
  name,
  description: richText(summary),
  excerpt: richText(summary),
  seo: {
    title: `${name} | Northstar Supply`,
    description: summary,
    openGraph: {
      title: name,
      description: summary,
      imageId: gid("MediaImage", `category-${handle}`),
    },
  },
  parentId: parentHandle ? gid("Category", parentHandle) : null,
  ancestorIds: parentHandle ? [gid("Category", parentHandle)] : [],
  childIds: categoryDefinitions
    .filter(([, , candidateParent]) => candidateParent === handle)
    .map(([childHandle]) => gid("Category", childHandle)),
  mediaIds: [gid("MediaImage", `category-${handle}`)],
  featuredMediaId: gid("MediaImage", `category-${handle}`),
  publishedAt,
  createdAt: publishedAt,
  updatedAt: FIXTURE_NOW,
}));
