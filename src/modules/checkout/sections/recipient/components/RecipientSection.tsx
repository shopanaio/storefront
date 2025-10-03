'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { FloatingLabelInput } from '@src/components/UI/FloatingLabelInput';

/**
 * Recipient section component.
 * Renders first name, last name, and middle name fields.
 */
export const RecipientSection = () => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const form = useFormContext();

  return (
    <Flex vertical gap={12} className={styles.container}>
      <Flex gap={12}>
        <FloatingLabelInput
          label={t('first-name')}
          value={form.watch('userFirstName')}
          onChange={(e) => form.setValue('userFirstName', e.target.value)}
        />
        <FloatingLabelInput
          label={t('last-name')}
          value={form.watch('userLastName')}
          onChange={(e) => form.setValue('userLastName', e.target.value)}
        />
      </Flex>
      <FloatingLabelInput
        label={t('middle-name')}
        value={form.watch('userMiddleName')}
        onChange={(e) => form.setValue('userMiddleName', e.target.value)}
      />
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default RecipientSection;
