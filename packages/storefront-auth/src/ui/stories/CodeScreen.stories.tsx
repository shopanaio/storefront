import type { Meta, StoryObj } from '@storybook/react-vite';
import { code, type CodeArgs } from './definitions/code';
import { BOARD_GLOBALS } from './frames';

/**
 * Boards SdkOtpCode, SdkVerifyEmailCode, SdkCheckoutDrawerCode (G3), SdkCheckoutDrawerMobile and
 * SdkCheckoutRequiredCode (A2). The code is always 6 digits (IAM).
 */
const meta = {
  title: 'Storefront Auth/Screens/Code',
  globals: BOARD_GLOBALS,
  ...code,
} satisfies Meta<CodeArgs>;

export default meta;
type StoryObject = StoryObj<typeof meta>;

export const Default: StoryObject = {};
export const VerifyEmail: StoryObject = { args: { purpose: 'verifyEmail' } };
