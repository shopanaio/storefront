import type { Meta, StoryObj } from '@storybook/react-vite';
import { forgot, type ForgotArgs } from './definitions/forgot';
import { BOARD_GLOBALS } from './frames';

/**
 * Boards SdkForgotPassword, SdkForgotPasswordSent, SdkCheckoutDrawerForgot (G2c) and
 * SdkCheckoutRequiredForgot (A1c).
 */
const meta = {
  title: 'Storefront Auth/Screens/Forgot',
  globals: BOARD_GLOBALS,
  ...forgot,
} satisfies Meta<ForgotArgs>;

export default meta;
type StoryObject = StoryObj<typeof meta>;

export const Default: StoryObject = {};
export const Sent: StoryObject = { args: { state: 'resetLinkSent' } };
