import { cmsPick } from "@src/cms/pick";
import useGetSessionShopana from "./useGetSession.shopana";
import useGetSessionShopify from "./useGetSession.shopify";

export interface GetSessionInput {
  customerAccessToken: string;
}

export default cmsPick({
  shopana: useGetSessionShopana,
  shopify: useGetSessionShopify,
});