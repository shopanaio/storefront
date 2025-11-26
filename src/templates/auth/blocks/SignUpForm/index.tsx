import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import useSignUp from "@src/hooks/auth/useSignUp";
import useSignIn from "@src/hooks/auth/useSingnIn";
import useGetSession from "@src/hooks/session/useGetSession";
import useSignUpHandler from "@src/hooks/auth/useSignUpHandler";
import { useModalStore } from "@src/store/appStore";
import { useSession } from "@src/hooks/useSession";
import { useTranslations } from "next-intl";

import { SignUp } from "@src/templates/auth/atoms/SignUp";
import accessTokenUtils from "@src/utils/accessToken";

interface SignUpFormProps {
  onSwitchForm: (form: "signIn") => void;
}

// Types for responses from different providers
interface ShopifyResponse {
  customerCreate?: {
    customer?: {
      firstName?: string;
      lastName?: string;
      email: string;
      phone?: string;
      acceptsMarketing?: boolean;
    };
    customerUserErrors?: Array<{
      field: string;
      message: string;
      code: string;
    }>;
  };
}

interface ShopanaResponse {
  passwordSignUp?: {
    session?: {
      accessToken: string;
      user: {
        id: string;
        iid: string;
        email: string;
      };
    };
    errors?: Array<{ message: string }>;
  };
}

type SignUpResponse = ShopifyResponse | ShopanaResponse;

// Types for sign-in responses
interface ShopifySignInResponse {
  customerAccessTokenCreate?: {
    customerAccessToken?: {
      accessToken: string;
    };
    customerUserErrors?: Array<{
      message: string;
    }>;
  };
}

interface ShopanaSignInResponse {
  passwordSignIn?: {
    session?: {
      accessToken: string;
      user: {
        id: string;
        iid: string;
        email: string;
      };
    };
    errors?: Array<{ message: string }>;
  };
}

type SignInResponse = ShopifySignInResponse | ShopanaSignInResponse;

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchForm }) => {
  const [error, setError] = useState<string | null>(null);
  const [shopifyAccessToken, setShopifyAccessToken] = useState<string | null>(
    null
  );
  const [commit, isInFlight] = useSignUp();
  const [signInCommit, isSignInInFlight] = useSignIn();
  const setIsAuthModalVisible = useModalStore(
    (state) => state.setIsAuthModalVisible
  );
  const setSession = useSession((state) => state.setSession);
  const refreshSession = useSession((state) => state.refreshSession);

  // Use new hook for handling registration
  const signUpHandler = useSignUpHandler();

  const t = useTranslations("Auth");

  // Hook for getting Shopify user information
  const customer = useGetSession.useGetSession(shopifyAccessToken || "");

  // Effect for handling Shopify user data
  useEffect(() => {
    if (customer && shopifyAccessToken) {
      // Update session with user information
      if (customer.customer) {
        setSession({
          user: {
            id: customer.customer.id,
            iid: customer.customer.id, // Use id as iid for Shopify
            email: customer.customer.email || "",
            phone: customer.customer.phone,
          },
          token: shopifyAccessToken,
        });

        // Close modal
        setTimeout(() => {
          setIsAuthModalVisible(false);
        }, 100);
      }
    }
  }, [customer, shopifyAccessToken, setSession, setIsAuthModalVisible]);

  // Function for automatic sign-in after registration
  const performAutoSignIn = async (email: string, password: string) => {
    console.log("🔐 Performing automatic login after registration...");

    signInCommit({
      variables: {
        input: {
          email,
          password,
        },
      },
      onCompleted: (response: SignInResponse, errors) => {
        console.log("✅ Automatic login completed successfully!");
        console.log("📥 Server response:", response);

        if (errors && errors.length > 0) {
          console.error("❌ Errors during automatic login:", errors);
          setError(errors[0].message);
          return;
        }

        // Process sign-in response through response types
        if ("passwordSignIn" in response) {
          // Shopana
          if (response.passwordSignIn?.session) {
            const session = response.passwordSignIn.session;

            // Set token in cookie
            if (session.accessToken) {
              accessTokenUtils.setAccessTokenCookie(session.accessToken);
            }

            // Setting session
            setSession({
              user: session.user,
              token: session.accessToken,
            });

            refreshSession();

            // Close modal
            setTimeout(() => {
              setIsAuthModalVisible(false);
            }, 100);
          }
        } else if ("customerAccessTokenCreate" in response) {
          // Shopify
          if (response.customerAccessTokenCreate?.customerAccessToken) {
            const accessToken =
              response.customerAccessTokenCreate.customerAccessToken
                .accessToken;

            setShopifyAccessToken(accessToken);
            accessTokenUtils.setAccessTokenCookie(accessToken);
          }
        }
      },
      onError: (error) => {
        console.error("💥 Automatic login error:", error);
        setError(error.message);
      },
    });
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string }>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setError(null);

    commit({
      variables: {
        input: {
          email: data.email,
          password: data.password,
        },
      },
      onCompleted: (response: SignUpResponse, errors) => {
        console.log("✅ Request completed successfully!");
        console.log("📥 Full server response:", response);

        if (errors && errors.length > 0) {
          console.error("❌ GraphQL errors:", errors);
          setError(errors[0].message);
          return;
        }

        // Use new hook for handling registration response
        signUpHandler.handleSignUpResponse(
          response,
          setIsAuthModalVisible,
          setError,
          setSession,
          refreshSession,
          t
        );

        // After successful registration in Shopify perform automatic login
        if ("customerCreate" in response && response.customerCreate?.customer) {
          console.log("🛍️ Shopify: Performing automatic login...");
          console.log("👤 Customer data:", response.customerCreate.customer);
          performAutoSignIn(data.email, data.password);
        } else if (
          "passwordSignUp" in response &&
          response.passwordSignUp?.session
        ) {
          console.log("🔐️ Shopana: Registration successful, session established");
        }
      },
      onError: (error) => {
        console.error("💥 Request execution error:", error);
        setError(error.message);
      },
    });
  };

  return (
    <SignUp
      onSwitchForm={onSwitchForm}
      control={control}
      errors={errors}
      error={error}
      isInFlight={isInFlight || isSignInInFlight}
      onSubmit={handleSubmit(onSubmit)}
      t={t}
    />
  );
};
