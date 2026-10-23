import type { Meta, StoryObj } from '@storybook/react-vite';
import { password, type PasswordArgs } from './definitions/password';
import { BOARD_GLOBALS } from './frames';

/** Boards SdkSignIn, SdkCheckoutDrawerPassword (G2b) and SdkCheckoutRequiredPassword (A1b). */
const meta = {
  title: 'Storefront Auth/Screens/Password',
  globals: BOARD_GLOBALS,
  ...password,
} satisfies Meta<PasswordArgs>;

export default meta;
type StoryObject = StoryObj<typeof meta>;

export const Default: StoryObject = {};
