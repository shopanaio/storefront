import { cmsPick } from "@src/cms/pick";
import useGreetingShopana from "./useGreeting.shopana";
import useGreetingShopify from "./useGreeting.shopify";

export default cmsPick({
  shopana: useGreetingShopana,
  shopify: useGreetingShopify,
});
