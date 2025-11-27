import { SignUpHandler } from "./useSignUpHandler";
import accessTokenUtils from "../../../../../utils/accessToken";

const useSignUpHandlerShopana = (): SignUpHandler => {
  return {
    handleSignUpResponse: (
      response: any,
      setIsAuthModalVisible: (visible: boolean) => void,
      setError: (error: string) => void,
      setSession: (session: any) => void,
      refreshSession: () => void,
      t: (key: string) => string
    ) => {
      console.log("Processing response from Shopana");

      if (response?.passwordSignUp?.session) {
        const session = response.passwordSignUp.session;
        console.log("Shopana session received:", session);
        console.log("User:", session.user);
        console.log("Access token:", session.accessToken);

        // Set token in cookie
        if (session.accessToken) {
          accessTokenUtils.setAccessTokenCookie(session.accessToken);
        }

        // Set session
        setSession({
          user: session.user,
          token: session.accessToken,
        });

        console.log("Shopana registration successful! Session established.");

        // First update session, then close modal
        refreshSession();

        // Add a small delay before closing the modal
        setTimeout(() => {
          setIsAuthModalVisible(false);
        }, 100);
      } else if (
        response?.passwordSignUp?.errors &&
        response.passwordSignUp.errors.length > 0
      ) {
        console.error("Shopana errors:", response.passwordSignUp.errors);
        setError(response.passwordSignUp.errors[0].message);
      } else {
        console.warn("Unexpected Shopana response format");
        setError(t("alert"));
      }
    },
  };
};

export default useSignUpHandlerShopana;
