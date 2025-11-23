import { cmsPick } from "@ecommerce-sdk/utils/cmsPick";
import useSignUpHandlerShopana from "./useSignUpHandler.shopana";
import useSignUpHandlerShopify from "./useSignUpHandler.shopify";

// Interface for session data
export interface SessionData {
  user: {
    id: string;
    iid: string;
    email: string;
    phone?: string;
  };
  token: string;
}

// Interface for sign up handler
export interface SignUpHandler {
  handleSignUpResponse: (
    response: any,
    setIsAuthModalVisible: (visible: boolean) => void,
    setError: (error: string) => void,
    setSession: (session: SessionData) => void,
    refreshSession: () => void,
    t: (key: string) => string
  ) => void;
}

export default cmsPick({
  shopana: useSignUpHandlerShopana,
  shopify: useSignUpHandlerShopify,
});
