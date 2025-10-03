'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { PhoneInputField } from './PhoneInputField';

/**
 * Contact section component.
 * Renders phone input field.
 */
export const ContactSection = () => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const { control } = useFormContext();

  return (
    <Flex vertical gap={12} className={styles.container}>
      <PhoneInputField
        control={control}
        name="userPhone"
        label={t('phone-number')}
        placeholder={t('phone')}
      />
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default ContactSection;
