import type { Meta, StoryObj } from '@storybook/react';
import { Wishlist } from '@src/modules/wishlist';

const meta = {
  title: 'Modules/Wishlist/Wishlist',
  component: Wishlist,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Wishlist>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    brand: <div style={{ fontWeight: 600 }}>Shopana Wishlist</div>,
    features: {},
  },
};
