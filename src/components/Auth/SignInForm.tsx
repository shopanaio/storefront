import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import useSignIn from "@src/hooks/auth/useSingnIn";
import useGetSession from "@src/hooks/session/useGetSession";
import useSignInHandler from "@src/hooks/auth/useSignInHandler";
import { useModalStore } from "@src/store/appStore";
import { useSessionStore } from "@src/providers/session-store-provider";
import { useTranslations } from "next-intl";

import { SignIn } from "../UI/Auth/SignIn";

interface SignInFormProps {
  onSwitchForm: (form: "signUp" | "forgotPassword") => void;
}

// Types for responses from different providers
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

export const SignInForm: React.FC<SignInFormProps> = ({ onSwitchForm }) => {
  const [error, setError] = useState<string | null>(null);
  const [shopifyAccessToken, setShopifyAccessToken] = useState<string | null>(
    null
  );
  const [commit, isInFlight] = useSignIn();
  const setSession = useSessionStore((state) => state.setSession);
  const setIsAuthModalVisible = useModalStore(
    (state) => state.setIsAuthModalVisible
  );
  const refreshSession = useSessionStore((state) => state.refreshSession);

  // Use new hook for handling sign-in
  const signInHandler = useSignInHandler();

  const t = useTranslations("Auth");

  // Hook for getting Shopify user information
  const customer = useGetSession.useGetSession(shopifyAccessToken || "");

  console.log("👤 Received user data:", customer);

  // Effect for handling Shopify user data
  useEffect(() => {
    if (customer && shopifyAccessToken) {
      console.log("👤 Received Shopify user information:", customer);

      // Update session with user information
      if (customer.customer) {
        setSession({
          accessToken: shopifyAccessToken,
          user: {
            id: customer.customer.id,
            email: customer.customer.email || "",
            firstName: customer.customer.firstName || "",
            lastName: customer.customer.lastName || "",
            iid: customer.customer.id, // For Shopify use id as iid
          },
        });

        console.log(
          "🎉 Shopify session updated with user information!"
        );

        // Close modal
        setTimeout(() => {
          setIsAuthModalVisible(false);
        }, 100);
      }
    }
  }, [customer, shopifyAccessToken, setSession, setIsAuthModalVisible]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string }>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setError(null);

    console.log("🚀 Sending login data:", data);

    commit({
      variables: {
        input: {
          email: data.email,
          password: data.password,
        },
      },
      onCompleted: (response: SignInResponse, errors) => {
        console.log("✅ Login request completed successfully!");
        console.log("📥 Full server response:", response);

        if (errors && errors.length > 0) {
          console.error("❌ GraphQL errors during login:", errors);
          setError(errors[0].message);
          return;
        }

        // For Shopify save token for getting user information
        if ("customerAccessTokenCreate" in response) {
          if (response.customerAccessTokenCreate?.customerAccessToken) {
            const token =
              response.customerAccessTokenCreate.customerAccessToken
                .accessToken;
            console.log(token);
            setShopifyAccessToken(token);
          }
        }

        signInHandler.handleSignInResponse(
          response,
          setIsAuthModalVisible,
          setError,
          setSession,
          refreshSession,
          t
        );
      },
      onError: (error) => {
        console.error("💥 Login request execution error:", error);
        setError(error.message);
      },
    });
  };

  return (
    <SignIn
      onSwitchForm={onSwitchForm}
      control={control}
      errors={errors}
      error={error}
      isInFlight={isInFlight}
      onSubmit={handleSubmit(onSubmit)}
      t={t}
    />
  );
};
