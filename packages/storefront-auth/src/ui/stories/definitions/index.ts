/**
 * Stories of the sign-in screens, one per design board: its `state` values and properties. The
 * Storybook of the storefront shows them without a theme; a theme's Storybook shows the same
 * stories in its own look (`@shopana/storefront-auth/stories`).
 */
export { identify, type IdentifyArgs } from './identify';
export { password, type PasswordArgs } from './password';
export { signUp, type SignUpArgs } from './signUp';
export { code, type CodeArgs } from './code';
export { forgot, type ForgotArgs } from './forgot';
export { result, type ResultArgs } from './result';
export { resetPassword, type ResetPasswordArgs } from './resetPassword';
export { emailVerification, type EmailVerificationArgs } from './emailVerification';
export { accountConnections, type AccountConnectionsArgs } from './accountConnections';
export { BOARD_GLOBALS } from '../frames';
