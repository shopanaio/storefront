import { cmsPick } from "@ecommerce-sdk/utils/cmsPick";
import useForgotPasswordShopana from "./useForgotPassword.shopana";
import useForgotPasswordShopify from "./useForgotPassword.shopify";

export interface ForgotPasswordInput {
  email: string;
}

export default cmsPick({
  shopana: useForgotPasswordShopana,
  shopify: useForgotPasswordShopify,
});