import { FIXTURE_NOW, gid, richText } from "../shared.js";

export const categoryDefinitions = [
  ["new-arrivals", "New arrivals", null, "Fresh food, gear, toys, and care essentials for happy pets."],
  ["dogs", "Dogs", null, "Everyday essentials selected for dogs of every size and life stage."],
  ["dog-food", "Dog food & treats", "dogs", "Complete meals, training treats, and long-lasting chews."],
  ["cats", "Cats", null, "Food, comfort, play, and enrichment for curious cats."],
  ["cat-food", "Cat food & treats", "cats", "Nutritious recipes and irresistible treats for cats."],
  ["walking", "Walking", null, "Comfortable, dependable gear for safe daily adventures."],
  ["collars-leashes", "Collars & leashes", "walking", "Collars, harnesses, leads, and walk-time accessories."],
  ["identification", "Pet identification", "walking", "Tags and smart identification to help pets get home safely."],
  ["feeding", "Feeding", null, "Practical solutions for healthier, calmer mealtimes."],
  ["bowls-feeders", "Bowls & feeders", "feeding", "Bowls, fountains, feeders, and hydration essentials."],
  ["beds-comfort", "Beds & comfort", "feeding", "Cozy beds, blankets, and peaceful spaces for better rest."],
  ["smart-pet", "Smart pet", null, "Helpful technology for care, safety, and connection."],
  ["trackers-cameras", "Trackers & cameras", "smart-pet", "Stay connected with GPS trackers, cameras, and monitors."],
  ["automatic-care", "Automatic care", "smart-pet", "Time-saving feeders, fountains, and litter solutions."],
  ["travel", "Travel", null, "Carriers, car protection, and portable gear for trips together."],
  ["sale", "Sale", null, "Pet favorites and seasonal essentials at reduced prices."],
];

const publishedAt = "2026-01-10T09:00:00.000Z";

export const categories = categoryDefinitions.map(([handle, name, parentHandle, summary]) => ({
  id: gid("Category", handle),
  handle,
  name,
  description: richText(summary),
  excerpt: richText(summary),
  seo: {
    title: `${name} | Paw & Whisker`,
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
