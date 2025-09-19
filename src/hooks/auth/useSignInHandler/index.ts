import { cmsPick } from "@src/cms/pick";
import { useSignInHandlerShopana } from "./useSignInHandler.shopana";
import { useSignInHandlerShopify } from "./useSignInHandler.shopify";

// Interface for session data
export interface SessionData {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    iid?: string;
  } | null;
}

// Interface for sign-in handler
export interface SignInHandler {
  handleSignInResponse: (
    response: any,
    setIsAuthModalVisible: (visible: boolean) => void,
    setError: (error: string) => void,
    setSession: (session: SessionData) => void,
    refreshSession: () => void,
    t: (key: string) => string
  ) => void;
}

export default cmsPick({
  shopana: useSignInHandlerShopana,
  shopify: useSignInHandlerShopify,
});
