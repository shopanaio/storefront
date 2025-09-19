import React, { useState } from "react";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { ResetPasswordForm } from "./ResetPasswordForm";

type AuthFormType = "signIn" | "signUp" | "forgotPassword" | "resetPassword";

export const Auth: React.FC = () => {
  const [activeForm, setActiveForm] = useState<AuthFormType>("signIn");

  const renderForm = () => {
    switch (activeForm) {
      case "signIn":
        return <SignInForm onSwitchForm={setActiveForm} />;
      case "signUp":
        return <SignUpForm onSwitchForm={setActiveForm} />;
      case "forgotPassword":
        return <ForgotPasswordForm onSwitchForm={setActiveForm} />;
      case "resetPassword":
        return <ResetPasswordForm />;
      default:
        return null;
    }
  };

  return <>{renderForm()}</>;
};
