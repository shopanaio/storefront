'use client';

import { Flex, Switch, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { ContactSelect } from '@src/modules/checkout/components/contact/ContactSelect';
import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';
import type { RecipientFormData } from '../types';

/**
 * View component for the checkout recipient section.
 *
 * Pure controlled UI component that renders the recipient form.
 * Receives generic form data and extracts needed fields.
 * Does not manage its own state - all state is controlled via props.
 */
export interface RecipientSectionViewProps {
  /** Current form data */
  data: RecipientFormData | null;
  /** Called to invalidate the section */
  invalidate: () => void;
}

export const RecipientSectionView = ({
  data,
  invalidate,
}: RecipientSectionViewProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');

  const [isRecipientSelf, setIsRecipientSelf] = useState(data?.self ?? true);

  /**
   * Handles switch toggle between self and another person
   */
  const handleSwitchChange = useCallback(
    (checked: boolean) => {
      setIsRecipientSelf(!checked);
    },
    []
  );

  return (
    <Flex vertical gap={12} className={styles.container}>
      <Flex className={styles.switchLabel}>
        <Switch
          id="is-recipient-self-switch"
          checked={!isRecipientSelf}
          onChange={handleSwitchChange}
        />
        <label htmlFor="is-recipient-self-switch" style={{ cursor: 'pointer' }}>
          <Typography.Text>{t('i-am-recipient')}</Typography.Text>
        </label>
      </Flex>

      {!isRecipientSelf ? (
        <ContactSelect
          initialValues={data}
          title={t('recipient')}
        />
      ) : null}
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  container: css``,
  switchLabel: css`
    display: flex;
    align-items: center;
    gap: ${token.marginXS}px;
  `,
}));

export default RecipientSectionView;
