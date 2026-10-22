import type { Meta, StoryObj } from '@storybook/react-vite';
import { identify, type IdentifyArgs } from './definitions/identify';
import { BOARD_GLOBALS } from './frames';

/**
 * Boards SdkMain (store), SdkCheckoutDrawerIdentify (G2), SdkCheckoutRequiredIdentify and
 * SdkCheckoutRequiredMobile (A1): the first screen of the sign-in.
 */
const meta = {
  title: 'Storefront Auth/Screens/Identify',
  globals: BOARD_GLOBALS,
  ...identify,
} satisfies Meta<IdentifyArgs>;

export default meta;
type StoryObject = StoryObj<typeof meta>;

export const Default: StoryObject = {};
export const CheckoutGuest: StoryObject = { args: { context: 'checkoutGuest' } };
export const CheckoutRequired: StoryObject = { args: { context: 'checkoutRequired' } };
