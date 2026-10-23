import type { Meta, StoryObj } from '@storybook/react-vite';
import { withCheckout } from '#checkout/stories/withCheckout';
import { makeLine } from '#checkout/stories/fixtures';
import { SummaryItem } from './SummaryItem';

const meta = {
  title: 'Checkout/Summary/SummaryItem',
  component: SummaryItem,
  decorators: [withCheckout],
  args: {
    line: makeLine({
      id: '1',
      title: 'Large, 32 cm',
      productTitle: 'Pepperoni pizza',
      quantity: 2,
      unitPrice: 289,
      imageSrc: 'https://picsum.photos/seed/pizza/200',
    }),
  },
} satisfies Meta<typeof SummaryItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Undeliverable: Story = { args: { undeliverable: true } };

export const WithoutImage: Story = {
  args: {
    line: makeLine({
      id: '2',
      title: 'Default',
      productTitle: 'Cola 0.5 l',
      unitPrice: 45,
    }),
  },
};

export const LongTitle: Story = {
  args: {
    line: makeLine({
      id: '3',
      title:
        'Family size with extra cheese, jalapeños and a double portion of sauce',
      productTitle: 'Four cheese pizza',
      unitPrice: 459,
      imageSrc: 'https://picsum.photos/seed/cheese/200',
    }),
  },
};
