import { cmsPick } from "@src/cms/pick";
import useSignUpShopana from "./useSignUp.shopana";
import useSignUpShopify from "./useSignUp.shopify";

// Universal interface for user sign up
export interface SignUpInput {
  email: string;
  password: string;
}

export default cmsPick({
  shopana: useSignUpShopana,
  shopify: useSignUpShopify,
});
