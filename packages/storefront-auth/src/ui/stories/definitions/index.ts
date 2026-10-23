/**
 * Stories of the sign-in screens, one per design board: its `state` values and properties. The
 * Storybook of the storefront shows them without a theme; a theme's Storybook in this workspace
 * shows the same stories in its own look, reading this file from the sources (its Storybook
 * aliases it). It is not an entry of the package: stories need Storybook, which the package
 * does not depend on. The published mocks and fixtures are `@shopana/storefront-auth/testing`.
 */
export { identify, type IdentifyArgs } from './identify';
export { password, type PasswordArgs } from './password';
export { signUp, type SignUpArgs } from './signUp';
export { code, type CodeArgs } from './code';
export { forgot, type ForgotArgs } from './forgot';
export { result, type ResultArgs } from './result';
export { resetPassword, type ResetPasswordArgs } from './resetPassword';
export {
  emailVerification,
  type EmailVerificationArgs,
} from './emailVerification';
export {
  accountConnections,
  type AccountConnectionsArgs,
} from './accountConnections';
export { BOARD_GLOBALS } from '../frames';
