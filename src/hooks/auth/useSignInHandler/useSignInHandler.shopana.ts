import { SignInHandler } from "./index";
import accessTokenUtils from "@src/utils/accessToken";

export const useSignInHandlerShopana = (): SignInHandler => {
  return {
    handleSignInResponse: (
      response: any,
      setIsAuthModalVisible: (visible: boolean) => void,
      setError: (error: string) => void,
      setSession: (session: any) => void,
      refreshSession: () => void,
      t: (key: string) => string
    ) => {
      console.log("🛍️ Processing sign-in response from Shopana");

      if (response?.passwordSignIn?.session) {
        const session = response.passwordSignIn.session;
        console.log("🔑 Shopana session received:", session);
        console.log("👤 User:", session.user);
        console.log("🔐 Access token:", session.accessToken);

        // Set token in cookie
        if (session.accessToken) {
          accessTokenUtils.setAccessTokenCookie(session.accessToken);
        }

        // Set session
        setSession({
          accessToken: session.accessToken,
          user: {
            id: session.user.id,
            email: session.user.email,
            iid: session.user.iid,
          },
        });

        console.log("🎉 Shopana sign-in successful! Session established.");

        // Update session and close modal
        refreshSession();

        setTimeout(() => {
          setIsAuthModalVisible(false);
        }, 100);
      } else if (
        response?.passwordSignIn?.errors &&
        response.passwordSignIn.errors.length > 0
      ) {
        console.error("⚠️ Shopana sign-in errors:", response.passwordSignIn.errors);
        setError(response.passwordSignIn.errors[0].message);
      } else {
        console.warn("⚠️ Unexpected Shopana sign-in response format");
        setError(t("alert"));
      }
    },
  };
};
