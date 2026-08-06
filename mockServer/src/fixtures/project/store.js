import { gid } from "../shared.js";
import { markets } from "./markets.js";

export const store = {
  id: gid("Store", "paw-and-whisker"),
  handle: "paw-and-whisker",
  name: "Paw & Whisker",
  description: "Thoughtful food, gear, toys, and care essentials for pets and their people.",
  email: "hello@pawandwhisker.example",
  timezone: "America/New_York",
  defaultLocale: "en",
  defaultCurrency: "USD",
  contact: {
    name: "Paw & Whisker Care Team",
    email: "care@pawandwhisker.example",
    phoneNumbers: ["+1-212-555-0147"],
  },
  address: {
    companyName: "Paw & Whisker Pet Co.",
    countryCode: "US",
    address1: "84 Franklin Street",
    address2: "Suite 5B",
    city: "Brooklyn",
    province: "New York",
    postalCode: "11222",
  },
  brand: {
    logoId: gid("MediaImage", "brand-logo"),
    squareLogoId: gid("MediaImage", "brand-square-logo"),
    coverImageId: gid("MediaImage", "brand-cover"),
    primaryColor: "#22352F",
    secondaryColor: "#E9DDC7",
    slogan: "Better days for every pet.",
    shortDescription: "Trusted food, playful enrichment, and practical care for pets of every kind.",
    socialLinks: [
      { platform: "instagram", url: "https://example.com/paw-and-whisker/instagram" },
      { platform: "pinterest", url: "https://example.com/paw-and-whisker/pinterest" },
      { platform: "youtube", url: "https://example.com/paw-and-whisker/youtube" },
    ],
  },
  marketIds: markets.map(({ id }) => id),
};
