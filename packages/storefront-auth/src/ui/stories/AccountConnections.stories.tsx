import type { Meta, StoryObj } from '@storybook/react-vite';
import { accountConnections, type AccountConnectionsArgs } from './definitions/accountConnections';
import { BOARD_GLOBALS } from './frames';

/** Board SdkAccountConnections: social accounts in the profile (`useAccountConnections`). */
const meta = {
  title: 'Storefront Auth/Screens/AccountConnections',
  globals: BOARD_GLOBALS,
  ...accountConnections,
} satisfies Meta<AccountConnectionsArgs>;

export default meta;
type StoryObject = StoryObj<typeof meta>;

export const Default: StoryObject = {};
