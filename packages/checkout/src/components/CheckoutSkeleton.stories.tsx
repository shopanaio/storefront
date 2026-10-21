import type { Meta, StoryObj } from '@storybook/react-vite';
import { withCheckout } from '#checkout/stories/withCheckout';
import { CheckoutSkeleton } from './CheckoutSkeleton';

const meta = {
  title: 'Checkout/Page/CheckoutSkeleton',
  component: CheckoutSkeleton,
  decorators: [withCheckout],
  parameters: { layout: 'fullscreen' },
  args: { brand: <strong>Storefront</strong>, isReady: false },
} satisfies Meta<typeof CheckoutSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {};
