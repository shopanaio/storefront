'use client';

import { ContactSelect } from '@src/modules/checkout/components/contact/ContactSelect';
import type { ContactValues } from '@src/modules/checkout/components/contact/ContactSelect';
import type { CheckoutFormValues } from '@src/modules/checkout/components/Checkout';
import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

/**
 * Contact section component.
 * Renders phone input field.
 */
export const ContactSection = () => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const form = useFormContext<CheckoutFormValues>();

  const [userFirstName, userLastName, userMiddleName, userPhone] = form.watch(
    ['userFirstName', 'userLastName', 'userMiddleName', 'userPhone'] as const
  );

  const values: ContactValues = {
    userFirstName: userFirstName || '',
    userLastName: userLastName || '',
    userMiddleName: userMiddleName || '',
    userPhone: userPhone || '',
  };

  const handleSave = (next: ContactValues) => {
    form.setValue('userFirstName', next.userFirstName);
    form.setValue('userLastName', next.userLastName);
    form.setValue('userMiddleName', next.userMiddleName);
    form.setValue('userPhone', next.userPhone);
  };

  return (
    <Flex vertical gap={12} className={styles.container}>
      <ContactSelect values={values} onSave={handleSave} title={t('contact')} />
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default ContactSection;
