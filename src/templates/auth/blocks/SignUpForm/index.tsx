import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSignUp, useSignUpHandler } from "@shopana/storefront-sdk/modules/session/react/hooks";
import { useSessionStore } from "@shopana/storefront-sdk/modules/session/react";
import { useModalStore } from "@src/store/appStore";
import { useTranslations } from "next-intl";
import type { signUpMutation$data } from "@shopana/storefront-sdk/modules/session/core/graphql/mutations/__generated__/signUpMutation.graphql";

import { SignUp } from "@src/templates/auth/atoms/SignUp";

interface SignUpFormProps {
  onSwitchForm: (form: "signIn") => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchForm }) => {
  const [error, setError] = useState<string | null>(null);
  const [commit, isInFlight] = useSignUp();
  const setIsAuthModalVisible = useModalStore(
    (state) => state.setIsAuthModalVisible
  );
  const setSession = useSessionStore()((state) => state.setSession);
  const refreshSession = useSessionStore()((state) => state.refreshSession);

  // Use new hook for handling registration
  const signUpHandler = useSignUpHandler();

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

    commit({
      variables: {
        input: {
          email: data.email,
          password: data.password,
        },
      },
      onCompleted: (response: signUpMutation$data, errors) => {
        console.log("Request completed successfully!");
        console.log("Full server response:", response);

        if (errors && errors.length > 0) {
          console.error("GraphQL errors:", errors);
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

        // After successful registration log session
        if (response.passwordSignUp?.session) {
          console.log("Shopana: Registration successful, session established");
        }
      },
      onError: (error) => {
        console.error("Request execution error:", error);
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
      isInFlight={isInFlight}
      onSubmit={handleSubmit(onSubmit)}
      t={t}
    />
  );
};
