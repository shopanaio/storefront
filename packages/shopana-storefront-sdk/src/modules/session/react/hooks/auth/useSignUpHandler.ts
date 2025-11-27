import accessTokenUtils from "../../../../../utils/accessToken";

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

export const useSignUpHandler = (): SignUpHandler => {
  return {
    handleSignUpResponse: (
      response: any,
      setIsAuthModalVisible: (visible: boolean) => void,
      setError: (error: string) => void,
      setSession: (session: any) => void,
      refreshSession: () => void,
      t: (key: string) => string
    ) => {
      console.log("Processing sign-up response");

      if (response?.passwordSignUp?.session) {
        const session = response.passwordSignUp.session;
        console.log("Session received:", session);
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

        console.log("Registration successful! Session established.");

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
        console.error("Sign-up errors:", response.passwordSignUp.errors);
        setError(response.passwordSignUp.errors[0].message);
      } else {
        console.warn("Unexpected sign-up response format");
        setError(t("alert"));
      }
    },
  };
};

export default useSignUpHandler;
