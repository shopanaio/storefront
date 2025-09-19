import { cmsPick } from "@src/cms/pick";
import useSignOutShopana from "./useSignOut.shopana";
import useSignOutShopify from "./useSignOut.shopify";

export interface SignOutInput {
  email: string;
  password: string;
}

export default cmsPick({
  shopana: useSignOutShopana,
  shopify: useSignOutShopify,
});