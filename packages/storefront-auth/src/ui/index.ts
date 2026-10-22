'use client';

/**
 * Sign-in screens of the headless storefront auth, on antd and `@shopana/storefront-ui`. All
 * behavior comes from `@shopana/storefront-auth/react`; a theme restyles them with its antd
 * `ConfigProvider`, `AuthUIProvider` and its own `Auth` messages of next-intl.
 */
export { AuthFlow, type AuthFlowNavigation, type AuthFlowProps } from './flow/AuthFlow';
export { AuthDialog, type AuthDialogProps } from './containers/AuthDialog';
export { AuthInline, type AuthInlineProps } from './containers/AuthInline';
export { AuthCard } from './containers/AuthCard';
export {
  ResetPasswordPage,
  type ResetPasswordPageProps,
} from './containers/ResetPasswordPage';
export {
  EmailVerificationPage,
  type EmailVerificationPageProps,
} from './containers/EmailVerificationPage';
export {
  AccountConnections,
  type AccountConnectionsProps,
} from './containers/AccountConnections';
export {
  AuthUIProvider,
  useAuthUI,
  type AuthLegalLinks,
  type AuthMethodTab,
  type AuthPart,
  type AuthUIComponents,
  type AuthUIProviderProps,
  type DividerProps,
  type LegalProps,
  type MethodTabsProps,
  type SocialButtonsProps,
} from './AuthUIProvider';
export { socialProviderView, type SocialProviderView } from './parts/providers';
export { AuthIntlProvider } from './i18n/AuthIntlProvider';
export { AUTH_NAMESPACE, authMessages, type AuthMessages } from './i18n/messages';
export { IdentifyScreen, type IdentifyScreenProps } from './screens/IdentifyScreen';
export {
  PasswordScreen,
  type PasswordNotice,
  type PasswordScreenProps,
} from './screens/PasswordScreen';
export {
  SignUpScreen,
  type SignUpScreenProps,
  type SignUpValues,
} from './screens/SignUpScreen';
export { CodeScreen, type CodeScreenProps } from './screens/CodeScreen';
export { ForgotScreen, type ForgotScreenProps } from './screens/ForgotScreen';
export {
  ResultScreen,
  SocialRedirectScreen,
  VerifyEmailLinkScreen,
  type ResultScreenProps,
  type VerifyEmailLinkScreenProps,
} from './screens/ResultScreen';
export {
  ResetPasswordScreen,
  type ResetPasswordScreenProps,
} from './screens/ResetPasswordScreen';
export {
  EmailVerificationScreen,
  type EmailVerificationScreenProps,
} from './screens/EmailVerificationScreen';
export {
  AccountConnectionsView,
  type AccountConnectionsViewProps,
} from './screens/AccountConnectionsView';
export type { AuthContext, IdentifyNotice, OtpPurpose } from './screens/types';
