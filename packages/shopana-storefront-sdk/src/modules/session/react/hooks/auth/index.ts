/**
 * Auth Hooks
 *
 * GraphQL mutation hooks for authentication and session management
 */

// Sign In / Sign Up / Sign Out
export { useSignIn, default as useSignInDefault } from './useSignIn';
export { useSignUp, default as useSignUpDefault } from './useSignUp';
export { useSignOut, default as useSignOutDefault } from './useSignOut';

// Password Recovery
export { useForgotPassword, default as useForgotPasswordDefault } from './useForgotPassword';
export { useResetPassword, default as useResetPasswordDefault } from './useResetPassword';

// Response Handlers
export { useSignInHandler, default as useSignInHandlerDefault, type SessionData, type SignInHandler } from './useSignInHandler';
export { useSignUpHandler, default as useSignUpHandlerDefault, type SignUpHandler } from './useSignUpHandler';
