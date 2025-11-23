import { cmsPick } from "@ecommerce-sdk/utils/cmsPick";
import useGetSessionShopana from "./useGetSession.shopana";
import useGetSessionShopify from "./useGetSession.shopify";

export interface GetSessionInput {
  customerAccessToken: string;
}

export default cmsPick({
  shopana: useGetSessionShopana,
  shopify: useGetSessionShopify,
});