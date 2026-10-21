import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { withCheckout } from '#checkout/stories/withCheckout';
import { CheckoutBanner } from './CheckoutBanner';

const meta = {
  title: 'Checkout/UI/CheckoutBanner',
  component: CheckoutBanner,
  decorators: [withCheckout],
  args: {
    tone: 'action',
    title: 'Choose a delivery method',
    description: 'Shipping is calculated once the address is filled in.',
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['critical', 'warning', 'action', 'success'],
    },
  },
} satisfies Meta<typeof CheckoutBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Action: Story = {
  args: {
    action: { label: 'Choose', onClick: fn() },
    onDismiss: fn(),
    dismissLabel: 'Close',
  },
};

export const Critical: Story = {
  args: {
    tone: 'critical',
    title: 'The payment failed',
    description: 'Your card was declined. Try another payment method.',
    action: { label: 'Try again', onClick: fn() },
  },
};

export const Warning: Story = {
  args: {
    tone: 'warning',
    title: 'The price of 2 items changed',
    description: 'Check the order summary before placing the order.',
    onDismiss: fn(),
    dismissLabel: 'Close',
  },
};

export const Success: Story = {
  args: {
    tone: 'success',
    title: 'Promo code applied',
    description: undefined,
    onDismiss: fn(),
    dismissLabel: 'Close',
  },
};

export const Loading: Story = {
  args: {
    tone: 'warning',
    title: 'Saving your address',
    action: { label: 'Retry', loading: true },
  },
};

export const Compact: Story = {
  args: {
    compact: true,
    action: { label: 'Choose', onClick: fn() },
    extra: '+2',
  },
};
