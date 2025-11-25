/**
 * Sign In Hook - SDK Integration
 *
 * Re-exports useSignIn from SDK
 *
 * @deprecated Use import from @shopana/storefront-sdk/modules/session/react/hooks instead
 */

export { useSignIn as default } from '@shopana/storefront-sdk/modules/session/react/hooks';

export interface SignInInput {
  email: string;
  password: string;
}
