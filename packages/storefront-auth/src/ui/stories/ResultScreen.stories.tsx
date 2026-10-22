import type { Meta, StoryObj } from '@storybook/react-vite';
import { result, type ResultArgs } from './definitions/result';
import { BOARD_GLOBALS } from './frames';

/** Boards SdkVerifyEmailLink and SdkSocialRedirect. */
const meta = {
  title: 'Storefront Auth/Screens/Result',
  globals: BOARD_GLOBALS,
  ...result,
} satisfies Meta<ResultArgs>;

export default meta;
type StoryObject = StoryObj<typeof meta>;

export const VerifyEmailLink: StoryObject = {};
export const SocialRedirect: StoryObject = { args: { board: 'socialRedirect' } };
