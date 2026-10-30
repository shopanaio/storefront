import type { Meta, StoryObj } from '@storybook/react-vite';
import { withCheckout } from '#checkout/stories/withCheckout';
import { BrandBar } from './BrandBar';
import { CheckoutSkeleton } from './CheckoutSkeleton';

const meta = {
  title: 'Checkout/Page/CheckoutSkeleton',
  component: CheckoutSkeleton,
  decorators: [withCheckout],
  parameters: { layout: 'fullscreen' },
  args: { header: <BrandBar><strong>Storefront</strong></BrandBar> },
} satisfies Meta<typeof CheckoutSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {};
