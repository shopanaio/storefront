'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
import React from 'react';
import { Space } from 'antd';
import {
  TbUser,
  TbMail,
  TbPhone,
  TbSearch,
  TbCurrencyDollar,
  TbCheck,
  TbX,
} from 'react-icons/tb';
import { FloatingLabelInput } from './FloatingLabelInput';

const meta: Meta<typeof FloatingLabelInput> = {
  title: 'UI/FloatingLabelInput',
  component: FloatingLabelInput,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    status: {
      control: 'select',
      options: ['', 'error', 'warning'],
    },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Enter text',
    style: { width: 300 },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '40px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FloatingLabelInput>;

/**
 * Default floating label input
 */
export const Default: Story = {
  args: {},
};

/**
 * Input with initial value (label floated)
 */
export const WithValue: Story = {
  args: {
    value: 'Some text value',
  },
  render: (initialArgs) => {
    const [args, updateArgs] = useArgs();
    return (
      <FloatingLabelInput
        {...args}
        onChange={(e) => updateArgs({ value: e.target.value })}
      />
    );
  },
};

/**
 * Input with prefix icon
 */
export const WithPrefix: Story = {
  args: {
    label: 'Email',
    prefix: <TbMail size={18} />,
  },
};

/**
 * Input with suffix icon
 */
export const WithSuffix: Story = {
  args: {
    label: 'Search',
    suffix: <TbSearch size={18} />,
  },
};

/**
 * Input with both prefix and suffix
 */
export const WithPrefixAndSuffix: Story = {
  args: {
    label: 'Username',
    prefix: <TbUser size={18} />,
    suffix: <TbCheck size={18} style={{ color: '#52c41a' }} />,
    value: 'john_doe',
  },
  render: () => {
    const [args, updateArgs] = useArgs();
    return (
      <FloatingLabelInput
        {...args}
        onChange={(e) => updateArgs({ value: e.target.value })}
      />
    );
  },
};

/**
 * Input with addonBefore
 */
export const WithAddonBefore: Story = {
  args: {
    label: 'Website URL',
    addonBefore: 'https://',
  },
};

/**
 * Input with addonAfter
 */
export const WithAddonAfter: Story = {
  args: {
    label: 'Price',
    addonAfter: 'USD',
  },
};

/**
 * Input with both addons
 */
export const WithBothAddons: Story = {
  args: {
    label: 'Domain',
    addonBefore: 'https://',
    addonAfter: '.com',
  },
};

/**
 * Input with prefix icon and addonBefore
 */
export const ComplexExample: Story = {
  args: {
    label: 'Amount',
    addonBefore: <TbCurrencyDollar size={16} />,
    addonAfter: 'USD',
    suffix: <TbCheck size={18} style={{ color: '#52c41a' }} />,
  },
};

/**
 * Error state
 */
export const Error: Story = {
  args: {
    label: 'Email',
    status: 'error',
    prefix: <TbMail size={18} />,
    value: 'invalid-email',
  },
  render: () => {
    const [args, updateArgs] = useArgs();
    return (
      <FloatingLabelInput
        {...args}
        onChange={(e) => updateArgs({ value: e.target.value })}
      />
    );
  },
};

/**
 * Warning state
 */
export const Warning: Story = {
  args: {
    label: 'Phone number',
    status: 'warning',
    prefix: <TbPhone size={18} />,
    value: '123',
  },
  render: () => {
    const [args, updateArgs] = useArgs();
    return (
      <FloatingLabelInput
        {...args}
        onChange={(e) => updateArgs({ value: e.target.value })}
      />
    );
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    label: 'Disabled field',
    disabled: true,
    value: 'Cannot edit',
  },
  render: () => {
    const [args, updateArgs] = useArgs();
    return (
      <FloatingLabelInput
        {...args}
        onChange={(e) => updateArgs({ value: e.target.value })}
      />
    );
  },
};

/**
 * Interactive playground with all options
 */
export const Playground: Story = {
  render: () => {
    const [value1, setValue1] = React.useState('');
    const [value2, setValue2] = React.useState('john@example.com');
    const [value3, setValue3] = React.useState('');
    const [value4, setValue4] = React.useState('');

    return (
      <Space direction="vertical" size="large" style={{ width: 350 }}>
        <FloatingLabelInput
          label="Full Name"
          value={value1}
          onChange={(e) => setValue1(e.target.value)}
          prefix={<TbUser size={18} />}
        />
        <FloatingLabelInput
          label="Email Address"
          value={value2}
          onChange={(e) => setValue2(e.target.value)}
          prefix={<TbMail size={18} />}
          suffix={value2 ? <TbCheck size={18} style={{ color: '#52c41a' }} /> : null}
        />
        <FloatingLabelInput
          label="Phone Number"
          value={value3}
          onChange={(e) => setValue3(e.target.value)}
          prefix={<TbPhone size={18} />}
          addonBefore="+380"
        />
        <FloatingLabelInput
          label="Website"
          value={value4}
          onChange={(e) => setValue4(e.target.value)}
          addonBefore="https://"
          addonAfter=".com"
        />
      </Space>
    );
  },
};

/**
 * Different states showcase
 */
export const AllStates: Story = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: 300 }}>
      {/* Uncontrolled */}
      <FloatingLabelInput label="Empty (default)" />
      {/* Controlled examples with local state to allow typing */}
      {(() => {
        const [v1, setV1] = React.useState('Type here...');
        const [v2, setV2] = React.useState('Valid input');
        const [v3, setV3] = React.useState('Invalid input');
        const [v4, setV4] = React.useState('Check this');
        const [v5, setV5] = React.useState('Cannot edit');
        return (
          <>
            <FloatingLabelInput label="Focused" value={v1} onChange={(e) => setV1(e.target.value)} />
            <FloatingLabelInput
              label="Success"
              value={v2}
              onChange={(e) => setV2(e.target.value)}
              suffix={<TbCheck size={18} style={{ color: '#52c41a' }} />}
            />
            <FloatingLabelInput
              label="Error"
              value={v3}
              onChange={(e) => setV3(e.target.value)}
              status="error"
              suffix={<TbX size={18} style={{ color: '#ff4d4f' }} />}
            />
            <FloatingLabelInput
              label="Warning"
              value={v4}
              onChange={(e) => setV4(e.target.value)}
              status="warning"
            />
            <FloatingLabelInput
              label="Disabled"
              value={v5}
              onChange={(e) => setV5(e.target.value)}
              disabled
            />
          </>
        );
      })()}
    </Space>
  ),
};

/**
 * Uncontrolled example with defaultValue
 */
export const UncontrolledWithDefault: Story = {
  args: {
    label: 'Uncontrolled with default',
  },
  render: (args) => (
    <FloatingLabelInput {...args} defaultValue="Starts with text" />
  ),
};

/**
 * Controlled basic example using useArgs
 */
export const ControlledBasic: Story = {
  args: {
    label: 'Controlled input',
    value: '',
  },
  render: () => {
    const [args, updateArgs] = useArgs();
    return (
      <FloatingLabelInput
        {...args}
        onChange={(e) => updateArgs({ value: e.target.value })}
      />
    );
  },
};
