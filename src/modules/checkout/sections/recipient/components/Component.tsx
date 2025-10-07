'use client';

import { Flex, Switch, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { ContactSelect } from '@src/modules/checkout/components/contact/ContactSelect';
import { useTranslations } from 'next-intl';
import { useState, useCallback, useEffect } from 'react';
import type { RecipientFormData } from '../types';
import { useCheckoutApi } from '@src/modules/checkout/context/CheckoutApiContext';
import type { ContactForm } from '@src/modules/checkout/components/contact/ContactSelect';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';
import { SectionId } from '@src/modules/checkout/state/interface';

/**
 * View component for the checkout recipient section.
 *
 * Logic:
 * - When self=true: recipient data removed from DB, uses customerIdentity
 * - When self=false: recipient data saved to DB, shows ContactSelect form
 *
 * The 'self' field is derived from presence of recipient in DB (see mapper).
 */
export interface RecipientSectionViewProps {
  /** Current form data */
  data: RecipientFormData | null;
}

export const RecipientSectionView = ({ data }: RecipientSectionViewProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const {
    addDeliveryRecipients,
    updateDeliveryRecipients,
    removeDeliveryRecipients,
  } = useCheckoutApi();

  const [isRecipientSelf, setIsRecipientSelf] = useState(data?.self ?? true);

  useEffect(() => {
    setIsRecipientSelf(data?.self ?? true);
  }, [data?.self]);

  /**
   * Update section 'required' flag based on 'self' value.
   * - self=true (I am recipient): required=false (uses customerIdentity)
   * - self=false (another person): required=true (must fill recipient form)
   *
   * If data is null, section is not required (initial state before any data).
   */
  useEffect(() => {
    if (!data) {
      // No data yet, section not required
      useCheckoutStore.getState().setSectionRequired(SectionId.Recipient, false);
      return;
    }

    // self=false means another person is recipient, so validation is required
    const required = data.self === false;
    useCheckoutStore.getState().setSectionRequired(SectionId.Recipient, required);
  }, [data?.self]);

  /**
   * Handles switch toggle between self and another person.
   *
   * When switching to self=true:
   * - Removes recipient from DB -> recipient becomes NULL
   * - Customer identity will be used as recipient
   *
   * When switching to self=false:
   * - Creates empty recipient in DB -> form becomes invalid
   * - User must fill the form to make section valid
   */
  const handleSwitchChange = useCallback(
    async (checked: boolean) => {
      const newSelf = !checked;
      setIsRecipientSelf(newSelf);

      if (!data?.deliveryGroupId) return;

      if (newSelf) {
        // Switching to self (recipient = customer) -> remove recipient from DB
        await removeDeliveryRecipients({
          deliveryGroupIds: [data.deliveryGroupId],
        });
      } else {
        // Switching to another person -> create empty recipient in DB
        // This will invalidate the section until user fills the form
        await addDeliveryRecipients({
          recipients: [
            {
              deliveryGroupId: data.deliveryGroupId,
              recipient: {
                firstName: '',
                lastName: '',
                middleName: '',
                phone: '',
              },
            },
          ],
        });
      }
    },
    [data?.deliveryGroupId, removeDeliveryRecipients, addDeliveryRecipients]
  );

  /**
   * Handles contact form submission for recipient.
   *
   * Always updates the recipient since it was already created empty
   * when user switched to self=false.
   */
  const handleContactSubmit = useCallback(
    async (contactData: ContactForm) => {
      if (!data?.deliveryGroupId) {
        console.error('No delivery group ID available');
        return;
      }

      const recipientData = {
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        middleName: contactData.middleName,
        phone: contactData.phone,
      };

      // Update recipient in DB (it was created empty on switch)
      await updateDeliveryRecipients({
        updates: [
          {
            deliveryGroupId: data.deliveryGroupId,
            recipient: recipientData,
          },
        ],
      });
    },
    [data?.deliveryGroupId, updateDeliveryRecipients]
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
