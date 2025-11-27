import { cmsPick } from "../../cms/pick";
import accessTokenShopana from "./accessToken.shopana";
import accessTokenShopify from "./accessToken.shopify";

const accessTokenUtils = cmsPick({
  shopana: accessTokenShopana,
  shopify: accessTokenShopify,
});

export default accessTokenUtils;
