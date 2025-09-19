import { cmsPick } from "@src/cms/pick";
import cartIdShopana from "./cartId.shopana";
import cartIdShopify from "./cartId.shopify";

const cartIdUtils = cmsPick({
  shopana: cartIdShopana,
  shopify: cartIdShopify,
});

export default cartIdUtils;