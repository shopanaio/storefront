import { cmsPick } from "@ecommerce-sdk/utils/cmsPick";
import useResetPasswordShopana from "./useResetPassword.shopana";
import useResetPasswordShopify from "./useResetPassword.shopify";

export interface ResetPasswordInput {
  // For Shopana
  email: string;
  password: string;
  token: string;

  // For Shopify
  id?: string; // User ID from reset URL
  resetToken?: string; // Token from reset URL
}

export default cmsPick({
  shopana: useResetPasswordShopana,
  shopify: useResetPasswordShopify,
});
