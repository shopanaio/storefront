'use client';

import { Flex, Switch, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { ContactSelect } from '@src/modules/checkout/components/contact/ContactSelect';
import type { ContactDto } from '@src/modules/checkout/core/contracts/dto';
import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';
import type { RecipientFormData } from '../types';

/**
 * View component for the checkout recipient section.
 *
 * Pure controlled UI component that renders the recipient form.
 * Receives generic form data and extracts needed fields.
 * Does not manage its own state - all state is controlled via props.
 *
 * @template TFormData - The form data type containing all form fields
 */
export interface RecipientSectionViewProps<TFormData = RecipientFormData> {
  /** Current form data */
  value: TFormData | null;
  /** Called when form data is valid */
  onValid: (data: TFormData) => void;
  /** Called when form data is invalid */
  onInvalid: (errors?: Record<string, string>) => void;
}

export const RecipientSectionView = ({
  value,
  onValid,
  onInvalid,
}: RecipientSectionViewProps<RecipientFormData>) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');

  const [isRecipientSelf, setIsRecipientSelf] = useState(
    value?.self ?? true
  );
  const [recipientData, setRecipientData] = useState<Partial<ContactDto>>({
    userFirstName: (value as any)?.userFirstName ?? '',
    userLastName: (value as any)?.userLastName ?? '',
    userMiddleName: (value as any)?.userMiddleName ?? '',
    userPhone: (value as any)?.userPhone ?? '',
  });

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
        onValid({ self: true } as TFormData);
      }
    },
    [onValid]
  );

  /**
   * Handles valid recipient data from view
   */
  const handleValid = useCallback(
    (dto: ContactDto) => {
      // Save recipient data to preserve it
      setRecipientData(dto);

      if (isRecipientSelf) {
        onValid({ self: true } as TFormData);
      } else {
        onValid({ self: false, ...dto } as TFormData);
      }
    },
    [isRecipientSelf, onValid]
  );

  /**
   * Handles invalid recipient data from view
   */
  const handleInvalid = useCallback(
    (errors?: Record<string, string>) => {
      onInvalid(errors);
    },
    [onInvalid]
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
          initialValues={recipientData}
          onValid={handleValid}
          onInvalid={handleInvalid}
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
