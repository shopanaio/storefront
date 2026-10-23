'use client';

/**
 * Sign-in screens of the headless storefront auth, on antd and `@shopana/storefront-ui`. All
 * behavior comes from `@shopana/storefront-auth/react`; a theme restyles them with its antd
 * `ConfigProvider`, `AuthUIProvider` and its own `Auth` messages of next-intl. The parts the
 * screens are built of are on `@shopana/storefront-auth/ui/primitives`.
 */
export { AuthFlow, type AuthFlowProps } from './flow/AuthFlow';
export {
  useAuthFlow,
  type AuthFlowNavigation,
  type AuthFlowOptions,
  type UseAuthFlowResult,
} from './flow/useAuthFlow';
export {
  DEFAULT_SCREENS,
  type AuthFlowScreenProps,
  type AuthFlowScreens,
  type AuthFlowView,
} from './flow/screens';
export {
  DEFAULT_CODE_LENGTH,
  canGoBack,
  currentScreen,
  flowReducer,
  initialFlow,
  reactToStep,
  screenOf,
  type FlowAction,
  type FlowScreen,
  type FlowScreenName,
  type FlowState,
  type StepReaction,
} from './flow/navigation';
export type { SignInScreen } from '../core/types';
export { AuthDialog, type AuthDialogProps } from './containers/AuthDialog';
export {
  AuthInline,
  type AuthInlineHandle,
  type AuthInlineProps,
} from './containers/AuthInline';
export { AuthCard, type AuthCardProps } from './containers/AuthCard';
export { CardHeader, type CardHeaderProps } from './containers/Headers';
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
  type AuthHeadingLevel,
  type AuthLegalLinks,
  type AuthMethodTab,
  type AuthPart,
  type AuthUIComponents,
  type AuthUIProviderProps,
  type DividerProps,
  type LegalProps,
  type MethodTabsProps,
  type PasswordRule,
  type PasswordRulesProps,
  type SocialButtonsProps,
} from './AuthUIProvider';
export { DefaultLegal, type DefaultLegalProps } from './parts/Legal';
export { socialProviderView, type SocialProviderView } from './parts/providers';
export {
  useLoginIdentifier,
  type LoginIdentifier,
} from './hooks/useLoginIdentifier';
export { AuthIntlProvider } from './i18n/AuthIntlProvider';
export {
  AUTH_NAMESPACE,
  authMessages,
  type AuthMessages,
} from './i18n/messages';
export {
  IdentifyScreen,
  type IdentifyScreenProps,
} from './screens/IdentifyScreen';
export {
  PasswordScreen,
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
  SigningInScreen,
  type SigningInScreenProps,
} from './screens/SigningInScreen';
export {
  ResultScreen,
  SocialRedirectScreen,
  VerifyEmailLinkScreen,
  type ResultScreenProps,
  type SocialRedirectScreenProps,
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
export {
  draftOf,
  type AuthContext,
  type AuthDraft,
  type AuthDraftChange,
  type IdentifyNotice,
  type OtpPurpose,
  type PasswordNotice,
} from './screens/types';
