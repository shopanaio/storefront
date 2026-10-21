import type { Meta, StoryObj } from '@storybook/react-vite';
import { Flex, Typography } from 'antd';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { withCheckout } from '#checkout/stories/withCheckout';
import { CheckoutMethodPanel } from './CheckoutMethodPanel';
import type { CheckoutMethodPanelProps } from './CheckoutMethodPanel';

const Details: CheckoutMethodPanelProps['component'] = () => (
  <Typography.Text type="secondary">
    The form of the selected method goes here.
  </Typography.Text>
);

const meta = {
  title: 'Checkout/Common/CheckoutMethodPanel',
  component: CheckoutMethodPanel,
  decorators: [withCheckout],
  args: {
    title: 'Courier delivery',
    description: 'Tomorrow, 10:00–14:00',
    isActive: false,
    onActive: fn(),
    component: Details,
  },
} satisfies Meta<typeof CheckoutMethodPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inactive: Story = {};

export const Active: Story = { args: { isActive: true } };
/** A method with nothing to fill in: no body under the header. */
export const WithoutDetails: Story = {
  args: { title: 'Pickup', description: null, isActive: true },
  render: (args) => <CheckoutMethodPanel {...args} component={null} />,
};

const METHODS = [
  {
    code: 'courier',
    title: 'Courier delivery',
    description: 'Tomorrow, 10:00–14:00',
  },
  { code: 'pickup', title: 'Pickup', description: 'Khreshchatyk St, 22' },
  { code: 'post', title: 'Nova Poshta', description: '1–2 days' },
];

function MethodGroup(props: CheckoutMethodPanelProps) {
  const [active, setActive] = useState(METHODS[0].code);
  return (
    <Flex vertical gap={8}>
      {METHODS.map((method) => (
        <CheckoutMethodPanel
          {...props}
          key={method.code}
          title={method.title}
          description={method.description}
          isActive={active === method.code}
          onActive={() => setActive(method.code)}
        />
      ))}
    </Flex>
  );
}

/** The methods of a section: one is chosen at a time. */
export const Group: Story = {
  render: (args) => <MethodGroup {...args} />,
};
