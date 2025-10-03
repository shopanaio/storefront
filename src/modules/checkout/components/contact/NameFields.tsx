'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { FloatingLabelInput } from '@src/components/UI/FloatingLabelInput';

export interface NameFieldsProps {
  /** Form field key for first name */
  firstNameKey: string;
  /** Form field key for last name */
  lastNameKey: string;
  /** Form field key for middle name */
  middleNameKey: string;
  /** Optional map to control antd status for each field */
  statusByKey?: Record<string, 'error' | 'warning' | undefined>;
}

/**
 * Reusable name fields group: first name, last name, middle name.
 */
export const NameFields = ({
  firstNameKey,
  lastNameKey,
  middleNameKey,
  statusByKey,
}: NameFieldsProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const form = useFormContext();

  return (
    <Flex vertical gap={12} className={styles.container}>
      <FloatingLabelInput
        label={t('first-name')}
        value={form.watch(firstNameKey)}
        onChange={(e) => form.setValue(firstNameKey, e.target.value)}
        status={statusByKey?.[firstNameKey]}
      />
      <FloatingLabelInput
        label={t('last-name')}
        value={form.watch(lastNameKey)}
        onChange={(e) => form.setValue(lastNameKey, e.target.value)}
        status={statusByKey?.[lastNameKey]}
      />
      <FloatingLabelInput
        label={t('middle-name')}
        value={form.watch(middleNameKey)}
        onChange={(e) => form.setValue(middleNameKey, e.target.value)}
        status={statusByKey?.[middleNameKey]}
      />
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default NameFields;
