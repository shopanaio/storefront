import type { Meta, StoryObj } from '@storybook/react-vite';
import { resetPassword, type ResetPasswordArgs } from './definitions/resetPassword';
import { BOARD_GLOBALS } from './frames';

/**
 * Boards SdkResetPassword, SdkResetPasswordDone and SdkLinkExpired (passwordReset): the page of
 * a reset link, `/account/reset-password`.
 */
const meta = {
  title: 'Storefront Auth/Screens/ResetPassword',
  globals: BOARD_GLOBALS,
  ...resetPassword,
} satisfies Meta<ResetPasswordArgs>;

export default meta;
type StoryObject = StoryObj<typeof meta>;

export const Default: StoryObject = {};
