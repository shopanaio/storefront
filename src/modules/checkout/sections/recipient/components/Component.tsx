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
  /** Called when form data is valid */
  onValid: () => void;
  /** Called when form data is invalid */
  onInvalid: (errors?: Record<string, string>) => void;
}

export const RecipientSectionView = ({
  data,
  onValid,
  onInvalid,
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
      if (checked) {
        // When switching to "another person", don't publish yet
        // Wait for user to fill the form
      } else {
        // When switching to "self", immediately publish
        onValid();
      }
    },
    [onValid]
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
          onValid={onValid}
          onInvalid={onInvalid}
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
