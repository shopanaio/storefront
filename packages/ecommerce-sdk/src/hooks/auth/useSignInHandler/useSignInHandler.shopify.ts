import { SignInHandler } from "./index";
import accessTokenUtils from "@src/utils/accessToken";

export const useSignInHandlerShopify = (): SignInHandler => {
  return {
    handleSignInResponse: (
      response: any,
      setIsAuthModalVisible: (visible: boolean) => void,
      setError: (error: string) => void,
      setSession: (session: any) => void,
      refreshSession: () => void,
      t: (key: string) => string
    ) => {
      console.log("🛍️ Processing sign-in response from Shopify");

      if (response?.customerAccessTokenCreate?.customerAccessToken) {
        const accessToken = response.customerAccessTokenCreate.customerAccessToken;
        console.log("🔑 Shopify access token received:", accessToken.accessToken);

        // Set token in cookie
        accessTokenUtils.setAccessTokenCookie(accessToken.accessToken);

        // For Shopify, first set only the token, user will be fetched separately
        setSession({
          accessToken: accessToken.accessToken,
          user: null, // User will be fetched separately
        });

        console.log("🎉 Shopify sign-in successful! Token established.");

        // Update session
        refreshSession();
      } else if (
        response?.customerAccessTokenCreate?.customerUserErrors &&
        response.customerAccessTokenCreate.customerUserErrors.length > 0
      ) {
        console.error(
          "⚠️ Shopify sign-in errors:",
          response.customerAccessTokenCreate.customerUserErrors
        );
        setError(
          response.customerAccessTokenCreate.customerUserErrors[0].message
        );
      } else {
        console.warn("⚠️ Unexpected Shopify sign-in response format");
        setError(t("alert"));
      }
    },
  };
};
