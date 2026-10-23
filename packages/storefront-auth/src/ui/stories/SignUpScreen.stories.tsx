import type { Meta, StoryObj } from '@storybook/react-vite';
import { signUp, type SignUpArgs } from './definitions/signUp';
import { BOARD_GLOBALS } from './frames';

/** Board SdkSignUp: a password account, the first name required, the last name not. */
const meta = {
  title: 'Storefront Auth/Screens/SignUp',
  globals: BOARD_GLOBALS,
  ...signUp,
} satisfies Meta<SignUpArgs>;

export default meta;
type StoryObject = StoryObj<typeof meta>;

export const Default: StoryObject = {};
