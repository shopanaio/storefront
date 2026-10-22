import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Flex } from 'antd';
import { useState } from 'react';
import { FloatingLabelPassword } from './FloatingLabelPassword';
import { PhoneInput } from './phone/PhoneInput';
import { ResponsiveDialog } from './ResponsiveDialog';
import { DrawerBase } from './drawer/DrawerBase';

const meta = {
  title: 'Storefront UI/Primitives',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Phone = ({ open, locale }: { open?: boolean; locale: string }) => {
  const [value, setValue] = useState<string | undefined>('+380671234567');
  return (
    <div style={{ maxWidth: 380 }}>
      <PhoneInput
        label="Номер телефону"
        value={value}
        onChange={setValue}
        locale={locale}
        pickerOpen={open}
        pickerTexts={{
          search: 'Пошук країни',
          title: 'Оберіть країну',
          empty: 'Нічого не знайдено',
          trigger: 'Країна: {country}, +{code}',
        }}
      />
    </div>
  );
};

export const PhoneNumber: Story = { render: () => <Phone locale="uk" /> };

export const PhoneCountryPicker: Story = {
  render: () => <Phone locale="uk" open />,
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
      <ResponsiveDialog open={dialog} onClose={() => setDialog(false)}>
        <Phone locale="uk" />
      </ResponsiveDialog>
      <DrawerBase open={drawer} onClose={() => setDrawer(false)} title="Drawer">
        <Phone locale="uk" />
      </DrawerBase>
    </Flex>
  );
};

export const DialogAndDrawer: Story = { render: () => <Overlays /> };
