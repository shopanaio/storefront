/**
 * Reset Password Hook - SDK Integration
 *
 * Re-exports useResetPassword from SDK
 *
 * @deprecated Use import from @shopana/storefront-sdk/modules/session/react/hooks instead
 */

export { useResetPassword as default } from '@shopana/storefront-sdk/modules/session/react/hooks';

export interface ResetPasswordInput {
  // For Shopana
  email?: string;
  password?: string;
  token: string;
  newPassword: string;

  // For Shopify
  id?: string; // User ID from reset URL
  resetToken?: string; // Token from reset URL
}
