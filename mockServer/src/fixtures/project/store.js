import { gid } from "../shared.js";
import { markets } from "./markets.js";

export const store = {
  id: gid("Store", "northstar-supply"),
  handle: "northstar-supply",
  name: "Northstar Supply",
  description: "Well-made essentials for everyday life, home, work, and weekends away.",
  email: "hello@northstar.example",
  timezone: "America/New_York",
  defaultLocale: "en",
  defaultCurrency: "USD",
  contact: {
    name: "Northstar Customer Care",
    email: "support@northstar.example",
    phoneNumbers: ["+1-212-555-0147"],
  },
  address: {
    companyName: "Northstar Supply Co.",
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
    slogan: "Useful things, thoughtfully made.",
    shortDescription: "Considered clothing, home goods, and technology for daily life.",
    socialLinks: [
      { platform: "instagram", url: "https://example.com/northstar/instagram" },
      { platform: "pinterest", url: "https://example.com/northstar/pinterest" },
      { platform: "youtube", url: "https://example.com/northstar/youtube" },
    ],
  },
  marketIds: markets.map(({ id }) => id),
};
