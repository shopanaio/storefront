'use client';

import { Flex, Switch, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { ContactSelect } from '@src/modules/checkout/components/contact/ContactSelect';
import { useTranslations } from 'next-intl';
import { useState, useCallback, useEffect } from 'react';
import type { RecipientFormData } from '../types';
import { useCheckoutApi } from '@src/modules/checkout/context/CheckoutApiContext';
import type { ContactForm } from '@src/modules/checkout/components/contact/ContactSelect';

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
  const { addDeliveryRecipients, updateDeliveryRecipients, removeDeliveryRecipients } =
    useCheckoutApi();

  const [isRecipientSelf, setIsRecipientSelf] = useState(data?.self ?? true);

  useEffect(() => {
    setIsRecipientSelf(data?.self ?? true);
  }, [data?.self]);

  /**
   * Handles switch toggle between self and another person
   */
  const handleSwitchChange = useCallback(
    async (checked: boolean) => {
      const newSelf = !checked;
      setIsRecipientSelf(newSelf);

      // If switching to self (recipient = customer), remove recipient data
      if (newSelf && data?.deliveryGroupId) {
        await removeDeliveryRecipients({
          deliveryGroupIds: [data.deliveryGroupId],
        });
      }
    },
    [data?.deliveryGroupId, removeDeliveryRecipients]
  );

  /**
   * Handles contact form submission
   * Determines whether to add or update recipient based on existing data
   */
  const handleContactSubmit = useCallback(
    async (contactData: ContactForm) => {
      if (!data?.deliveryGroupId) {
        console.error('No delivery group ID available');
        return;
      }

      const hasExistingRecipient = Boolean(
        data?.firstName || data?.lastName || data?.phone
      );

      const recipientData = {
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        middleName: contactData.middleName,
        phone: contactData.phone,
      };

      if (hasExistingRecipient) {
        // Update existing recipient
        await updateDeliveryRecipients({
          updates: [
            {
              deliveryGroupId: data.deliveryGroupId,
              recipient: recipientData,
            },
          ],
        });
      } else {
        // Add new recipient
        await addDeliveryRecipients({
          recipients: [
            {
              deliveryGroupId: data.deliveryGroupId,
              recipient: recipientData,
            },
          ],
        });
      }
    },
    [data, addDeliveryRecipients, updateDeliveryRecipients]
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
          data={
            data
              ? {
                  firstName: data.firstName ?? '',
                  lastName: data.lastName ?? '',
                  middleName: data.middleName ?? '',
                  phone: data.phone ?? '',
                }
              : null
          }
          title={t('recipient')}
          onSubmit={handleContactSubmit}
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
