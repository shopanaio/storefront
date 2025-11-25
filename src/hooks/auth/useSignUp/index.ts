/**
 * Sign Up Hook - SDK Integration
 *
 * Re-exports useSignUp from SDK
 *
 * @deprecated Use import from @shopana/storefront-sdk/modules/session/react/hooks instead
 */

export { useSignUp as default } from '@shopana/storefront-sdk/modules/session/react/hooks';

// Universal interface for user sign up
export interface SignUpInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
