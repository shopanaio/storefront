/**
 * Forgot Password Hook - SDK Integration
 *
 * Re-exports useForgotPassword from SDK
 *
 * @deprecated Use import from @shopana/storefront-sdk/modules/session/react/hooks instead
 */

export { useForgotPassword as default } from '@shopana/storefront-sdk/modules/session/react/hooks';

export interface ForgotPasswordInput {
  email: string;
}