import { cmsPick } from "@src/cms/pick";
import ReviewsShopana from "./Reviews.shopana";

// Provide both keys to avoid cmsPick throwing during module import
const NOT_IMPLEMENTED: any = {};

export default cmsPick({
  shopana: ReviewsShopana,
  shopify: NOT_IMPLEMENTED,
});

