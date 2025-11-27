import accessTokenUtils from "../../../../../utils/accessToken";

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

export const useSignInHandler = (): SignInHandler => {
  return {
    handleSignInResponse: (
      response: any,
      setIsAuthModalVisible: (visible: boolean) => void,
      setError: (error: string) => void,
      setSession: (session: any) => void,
      refreshSession: () => void,
      t: (key: string) => string
    ) => {
      console.log("Processing sign-in response");

      if (response?.passwordSignIn?.session) {
        const session = response.passwordSignIn.session;
        console.log("Session received:", session);
        console.log("User:", session.user);
        console.log("Access token:", session.accessToken);

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

        console.log("Sign-in successful! Session established.");

        // Update session and close modal
        refreshSession();

        setTimeout(() => {
          setIsAuthModalVisible(false);
        }, 100);
      } else if (
        response?.passwordSignIn?.errors &&
        response.passwordSignIn.errors.length > 0
      ) {
        console.error("Sign-in errors:", response.passwordSignIn.errors);
        setError(response.passwordSignIn.errors[0].message);
      } else {
        console.warn("Unexpected sign-in response format");
        setError(t("alert"));
      }
    },
  };
};

export default useSignInHandler;
