import { SignUpHandler } from "./index";
import accessTokenUtils from "@src/utils/accessToken";

const useSignUpHandlerShopify = (): SignUpHandler => {
  return {
    handleSignUpResponse: (
      response: any,
      setIsAuthModalVisible: (visible: boolean) => void,
      setError: (error: string) => void,
      setSession: (session: any) => void,
      refreshSession: () => void,
      t: (key: string) => string
    ) => {
      console.log("🛍️ Processing response from Shopify");

      if (response?.customerCreate?.customer) {
        console.log("👤 response", response);
        const customer = response.customerCreate.customer;
        console.log("👤 Shopify customer created:", customer);

        console.log(
          "🎉 Shopify registration successful! Performing automatic login..."
        );

        // For Shopify, don't close the modal and don't set session here
        // We will perform automatic login
        // But we can save information that registration was successful
        console.log("✅ Customer successfully created, awaiting automatic login...");
      } else if (
        response?.customerCreate?.customerUserErrors &&
        response.customerCreate.customerUserErrors.length > 0
      ) {
        console.error(
          "⚠️ Shopify validation errors:",
          response.customerCreate.customerUserErrors
        );
        setError(response.customerCreate.customerUserErrors[0].message);
      } else {
        console.warn("⚠️ Unexpected Shopify response format");
        setError(t("alert"));
      }
    },
  };
};

export default useSignUpHandlerShopify;
