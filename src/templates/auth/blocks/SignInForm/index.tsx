import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSignIn, useSignInHandler } from "@shopana/storefront-sdk/modules/session/react/hooks";
import { useSessionStore } from "@shopana/storefront-sdk/modules/session/react";
import { useModalStore } from "@src/store/appStore";
import { useTranslations } from "next-intl";
import type { signInMutation$data } from "@shopana/storefront-sdk/modules/session/core/graphql/mutations/__generated__/signInMutation.graphql";

import { SignIn } from "@src/templates/auth/atoms/SignIn";

interface SignInFormProps {
  onSwitchForm: (form: "signUp" | "forgotPassword") => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onSwitchForm }) => {
  const [error, setError] = useState<string | null>(null);
  const [commit, isInFlight] = useSignIn();
  const setSession = useSessionStore()((state) => state.setSession);
  const setIsAuthModalVisible = useModalStore(
    (state) => state.setIsAuthModalVisible
  );
  const refreshSession = useSessionStore()((state) => state.refreshSession);

  // Use new hook for handling sign-in
  const signInHandler = useSignInHandler();

  const t = useTranslations("Auth");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string }>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setError(null);

    console.log("Sending login data:", data);

    commit({
      variables: {
        input: {
          email: data.email,
          password: data.password,
        },
      },
      onCompleted: (response: signInMutation$data, errors) => {
        console.log("Login request completed successfully!");
        console.log("Full server response:", response);

        if (errors && errors.length > 0) {
          console.error("GraphQL errors during login:", errors);
          setError(errors[0].message);
          return;
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
        console.error("Login request execution error:", error);
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
