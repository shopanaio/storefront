import { cmsPick } from "@ecommerce-sdk/utils/cmsPick";
import useSignInShopana from "./useSignIn.shopana";
import useSignInShopify from "./useSignIn.shopify";

export interface SignInInput {
  email: string;
  password: string;
}

export default cmsPick({
  shopana: useSignInShopana,
  shopify: useSignInShopify,
});