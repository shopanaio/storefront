import type { Meta, StoryObj } from '@storybook/react-vite';
import { FloatingLabelInput } from './FloatingLabelInput';

const meta = {
  title: 'Storefront UI/FloatingLabelInput',
  component: FloatingLabelInput,
  args: { label: 'Email' },
} satisfies Meta<typeof FloatingLabelInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = { args: { defaultValue: 'buyer@example.com' } };

export const WithError: Story = {
  args: { defaultValue: 'buyer@', error: 'Enter a valid email' },
};

export const Disabled: Story = {
  args: { defaultValue: 'buyer@example.com', disabled: true },
};
