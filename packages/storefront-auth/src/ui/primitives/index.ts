'use client';

/**
 * Building blocks of the sign-in screens, for a screen of a host's own (`screens` of
 * `AuthFlow`) that looks like the others: `@shopana/storefront-auth/ui/primitives`. They read
 * the theme of `AuthUIProvider` and the `Auth` texts, so render them under `AuthFlow` or
 * `AuthIntlProvider`.
 */
export {
  Screen,
  Stack,
  Badge,
  Chip,
  Footer,
  MediaCircle,
  MEDIA_SIZE,
} from '../common/layout';
export {
  ScreenTitle,
  AuthHeadingSlotContext,
  useHeadingSlot,
  type AuthHeadingSlot,
} from '../common/heading';
export {
  AuthAlert,
  RateLimitAlert,
  useErrorAlert,
  useRateLimit,
  type ErrorAlertOverrides,
} from '../common/alerts';
export {
  SubmitButton,
  TextAction,
  InlineAction,
  ResendAction,
  type ResendActionProps,
} from '../common/actions';
export {
  AuthForm,
  Field,
  EmailField,
  usePasswordRules,
  useSubmit,
} from '../common/form';
export {
  CodeCells,
  type CodeCellsProps,
  type CodeCellsState,
} from '../common/CodeCells';
export { DefaultPasswordRules } from '../parts/PasswordRules';
export { formatResend, formatWait, initialOf } from '../common/format';
