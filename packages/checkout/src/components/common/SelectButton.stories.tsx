import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { LuMapPin } from 'react-icons/lu';
import { withCheckout } from '#checkout/stories/withCheckout';
import { SelectButton } from './SelectButton';

const meta = {
  title: 'Checkout/Common/SelectButton',
  component: SelectButton,
  decorators: [withCheckout],
  args: { placeholder: 'Choose a city', hasValue: false, onClick: fn() },
} satisfies Meta<typeof SelectButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Selected: Story = {
  args: { hasValue: true, mainText: 'Kyiv', secondaryText: 'Kyiv region' },
};

export const WithIcon: Story = {
  args: { hasValue: true, mainText: 'Khreshchatyk St, 22', icon: <LuMapPin /> },
};

export const Inverted: Story = {
  args: {
    hasValue: true,
    mainText: 'Kyiv',
    secondaryText: 'City',
    invert: true,
  },
};
