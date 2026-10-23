import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { LuSparkles } from 'react-icons/lu';
import { Banner } from './Banner';
import { BannerProvider } from './BannerProvider';

const meta = {
  title: 'Storefront UI/Banner',
  component: Banner,
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
} satisfies Meta<typeof Banner>;

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

/**
 * A theme restyles the banners through `BannerProvider`: classes and styles of the parts, the
 * icons and the colors of the tones (here a squarer, louder `action` tone).
 */
export const Themed: Story = {
  decorators: [
    (Story) => (
      <BannerProvider
        styles={{
          root: { borderRadius: 4, borderWidth: 2 },
          title: { fontWeight: 700 },
        }}
        icons={{ action: LuSparkles }}
        tones={{
          action: {
            background: '#fff7e6',
            border: '#ffa940',
            accent: '#d46b08',
          },
        }}
      >
        <Story />
      </BannerProvider>
    ),
  ],
  args: { action: { label: 'Choose', onClick: fn() } },
};
