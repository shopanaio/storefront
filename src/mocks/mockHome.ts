import { mockCategory } from "./category";
import { mockCategory2 } from "./category2";
import { mockCategory3 } from "./category3";


export const mockHome = {
  shopByCategory: mockCategory2, // category + children
  ourTrendyProducts: [mockCategory, mockCategory2, mockCategory3], // 4 categories with listing
  featuredCategories: mockCategory, // category + children
  mightLikeCategory: mockCategory, // category with listing
  trendingProducts: mockCategory, // category with listing
  recommended: mockCategory, // category with listing
};


/* export const mockHome2 = [
  { title: "Shop by categories", entry: mockCategory2.children },
  {
    title: "Our Trendy Products",
    entry: [mockCategory, mockCategory2, mockCategory3]
  },
  { title: "Featured Categories", entry: mockCategory.children },
  { title: "Might Like", entry: mockCategory2.listing },
  {
    title: "Trending Products",
    entry: mockCategory.listing,
    banner: { placement: "after", entry: mockCategory.listing.edges[0].node },
  },
  {
    title: "Recommended",
    entry: mockCategory2.listing,
    banner: { placement: "after", entry: mockCategory2.listing.edges[0].node },
  },
  { title: "Video Banner" },
]; */

export const mockHome3 = [
  {
    type: "grid",
    settings: {
      title: "Shop by categories",
      sources: [mockCategory2],
      pagination: true
    }
  },

  {
    type: "slider",
    settings: {
      title: "Our Trendy Products",
      sources: [mockCategory, mockCategory2, mockCategory3]
    },
  },

  {
    type: "grid",
    settings: {
      title: "Featured Categories",
      sources: [mockCategory],
      pagination: true
    }
  },

  {
    type: "slider",
    settings: {
      title: "Might Like",
      sources: [mockCategory2],
      pagination: true
    }
  },

  {
    type: "slider",
    settings: {
      title: "Trending Products",
      sources: [mockCategory],
      banner: { placement: "after", entry: mockCategory.listing.edges[0].node },
      pagination: true
    }
  },

  {
    type: "slider",
    settings: {
      title: "Recommended",
      sources: [mockCategory2],
      banner: { placement: "before", entry: mockCategory2.listing.edges[1].node },
      pagination: false
    }
  },
  {
    type: "player",
    settings: {
      title: "Discover new arrival!", description: 'Offering the latest smartphones, headphones, and smartwatches from top brands.',
      video: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
      cover: "https://images.hindustantimes.com/tech/img/2024/11/08/1600x900/OnePlus_13_launching_on_October_31_1729503323498_1731048803730.jpg"
    }
  },
];

export const mockHome4 = [
  {
    type: "grid",
    settings: {
      title: "Shop by categories",
      sources: [mockCategory2],
      renderItem: 'CategoryCard',
      pagination: true
    }
  },

  {
    type: "slider",
    settings: {
      title: "Our Trendy Products",
      sources: [mockCategory, mockCategory2, mockCategory3]
    },
  },

  {
    type: "grid",
    settings: {
      title: "Featured Categories",
      sources: [mockCategory],
      renderItem: 'CategoryCardCircle',
      pagination: true
    }
  },

  {
    type: "slider",
    settings: {
      title: "Might Like",
      sources: [mockCategory2],
      pagination: true
    }
  },

  {
    type: "product-slideshow-with-banner",
    settings: {
      title: "Trending Products",
      sources: [mockCategory],
      banner: { placement: "after", entry: mockCategory.listing.edges[0].node },
      pagination: true
    }
  },

  {
    type: "product-slideshow-with-banner",
    settings: {
      title: "Recommended",
      sources: [mockCategory2],
      banner: { placement: "before", entry: mockCategory2.listing.edges[1].node },
      pagination: false
    }
  },
  {
    type: "player",
    settings: {
      title: "Discover new arrival!", description: 'Offering the latest smartphones, headphones, and smartwatches from top brands.',
      video: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
      cover: "https://images.hindustantimes.com/tech/img/2024/11/08/1600x900/OnePlus_13_launching_on_October_31_1729503323498_1731048803730.jpg"
    }
  },
];
