import type { Meta, StoryObj } from '@storybook/react-vite';
import { emailVerification, type EmailVerificationArgs } from './definitions/emailVerification';
import { BOARD_GLOBALS } from './frames';

/**
 * Boards SdkEmailVerified and SdkLinkExpired (emailVerification): the page of a verification
 * link, `/account/verify-email`.
 */
const meta = {
  title: 'Storefront Auth/Screens/EmailVerification',
  globals: BOARD_GLOBALS,
  ...emailVerification,
} satisfies Meta<EmailVerificationArgs>;

export default meta;
type StoryObject = StoryObj<typeof meta>;

export const Default: StoryObject = {};
