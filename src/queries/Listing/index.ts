import { cmsPick } from "@src/cms/pick";
import ListingShopana from "./Listing.shopana";
import ListingShopify from "./Listing.shopify";

export default cmsPick({
  shopana: ListingShopana,
  shopify: ListingShopify,
});

