import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Flex } from 'antd';
import { useState } from 'react';
import { FloatingLabelPassword } from './FloatingLabelPassword';
import { PhoneInput } from './phone/PhoneInput';
import { ResponsiveDialog } from './drawer/ResponsiveDialog';
import { DrawerBase } from './drawer/DrawerBase';
import { StorefrontUIProvider } from './StorefrontUIProvider';

/** Ukrainian texts of the components, given once for all of them. */
const UK_TEXTS = {
  close: 'Закрити',
  countryPicker: {
    title: 'Оберіть країну',
    trigger: (country: string, code: string) => `Країна: ${country}, +${code}`,
  },
};

const meta = {
  title: 'Storefront UI/Primitives',
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <StorefrontUIProvider locale="uk" texts={UK_TEXTS}>
        <Story />
      </StorefrontUIProvider>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Phone = ({ open }: { open?: boolean }) => {
  const [value, setValue] = useState<string | undefined>('+380671234567');
  return (
    <div style={{ maxWidth: 380 }}>
      <PhoneInput
        label="Номер телефону"
        value={value}
        onChange={setValue}
        pickerOpen={open}
      />
    </div>
  );
};

export const PhoneNumber: Story = { render: () => <Phone /> };

export const PhoneCountryPicker: Story = {
  render: () => <Phone open />,
};

export const Password: Story = {
  render: () => (
    <div style={{ maxWidth: 380 }}>
      <FloatingLabelPassword label="Пароль" defaultValue="secret-password" />
    </div>
  ),
};

const Overlays = () => {
  const [dialog, setDialog] = useState(false);
  const [drawer, setDrawer] = useState(false);
  return (
    <Flex gap={8}>
      <Button onClick={() => setDialog(true)}>ResponsiveDialog</Button>
      <Button onClick={() => setDrawer(true)}>DrawerBase</Button>
      <ResponsiveDialog
        open={dialog}
        onClose={() => setDialog(false)}
        title="Телефон"
      >
        <Phone />
      </ResponsiveDialog>
      <DrawerBase open={drawer} onClose={() => setDrawer(false)} title="Drawer">
        <Phone />
      </DrawerBase>
    </Flex>
  );
};

export const DialogAndDrawer: Story = { render: () => <Overlays /> };
