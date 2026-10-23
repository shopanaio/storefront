'use client';

import { Flex, Switch, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { ContactSelect } from '#checkout/components/contact/ContactSelect';
import { useTranslations } from 'next-intl';
import {
  useState,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
} from 'react';
import type { RecipientFormData } from '../types';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';
import type { ContactForm } from '#checkout/components/contact/ContactSelect';
import { useCheckoutStore } from '#checkout/state/checkoutStore';
import { SectionId } from '#checkout/state/interface';
import { logError } from '@shopana/storefront-sdk/utils/logger';

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
  /** Keeps the section invalid while set */
  holdInvalid?: (held: boolean) => void;
}

const EMPTY_RECIPIENT = {
  firstName: '',
  lastName: '',
  middleName: '',
  phone: '',
};

export const RecipientSectionView = ({
  data,
  holdInvalid,
}: RecipientSectionViewProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const { saveDeliveryRecipient } = useCheckoutApi();

  /**
   * The switch as the buyer set it (BR-yanp). Until the buyer touches it, it follows the
   * checkout; afterwards a regrouping of the delivery, which may leave groups without the
   * recipient, does not move it.
   */
  const [chosenSelf, setChosenSelf] = useState<boolean | null>(null);
  const isRecipientSelf = chosenSelf ?? data?.self ?? true;

  /**
   * Update section 'required' flag based on the switch.
   * - self=true (I am recipient): required=false (uses customerIdentity)
   * - self=false (another person): required=true (must fill recipient form)
   *
   * If data is null, section is not required (initial state before any data).
   */
  useEffect(() => {
    useCheckoutStore
      .getState()
      .setSectionRequired(
        SectionId.Recipient,
        Boolean(data) && !isRecipientSelf
      );
  }, [data, isRecipientSelf]);

  // Another person receives the order, but the checkout has no recipient yet: the order must
  // not go to the customer meanwhile.
  const missingRecipient =
    Boolean(data) && !isRecipientSelf && data?.self === true;
  useEffect(() => {
    holdInvalid?.(missingRecipient);
  }, [missingRecipient, holdInvalid]);

  const savedRecipient = useMemo(
    () =>
      data && !data.self
        ? {
            firstName: data.firstName ?? '',
            lastName: data.lastName ?? '',
            middleName: data.middleName ?? '',
            phone: data.phone ?? '',
          }
        : null,
    [data]
  );

  /** The recipient the buyer saved last: groups that lose it on a regrouping get it back. */
  const [knownRecipient, setKnownRecipient] = useState(savedRecipient);
  if (
    savedRecipient &&
    JSON.stringify(savedRecipient) !== JSON.stringify(knownRecipient)
  ) {
    setKnownRecipient(savedRecipient);
  }

  /**
   * Groups without the recipient while another person receives the order (a shipment split
   * off, or the delivery regrouped): they get the saved recipient, or an empty one that keeps
   * the section invalid until the buyer fills it. A save of the buyer waiting in the queue
   * replaces this one.
   */
  const missingGroups = !isRecipientSelf
    ? (data?.groupIdsWithoutRecipient ?? []).join(',')
    : '';
  // Reads the recipient known when it runs, without running again for every recipient change.
  const addKnownRecipient = useEffectEvent(() => {
    saveDeliveryRecipient(knownRecipient ?? EMPTY_RECIPIENT).catch(
      (error: unknown) => {
        logError('Failed to add the recipient to the delivery groups', {
          error,
          component: 'RecipientSection',
        });
      }
    );
  });
  // Runs for a new set of groups without the recipient (and a new save function).
  useEffect(() => {
    if (!missingGroups) return;
    addKnownRecipient();
  }, [missingGroups, saveDeliveryRecipient]);

  /**
   * Handles switch toggle between self and another person.
   *
   * When switching to self=true the recipient is removed and the customer identity is used.
   * When switching to self=false the groups get it through the effect above (empty at first),
   * which keeps the section invalid until the buyer fills the form.
   */
  const handleSwitchChange = useCallback(
    async (checked: boolean) => {
      const newSelf = !checked;
      setChosenSelf(newSelf);
      if (!newSelf || !data?.deliveryGroupIds.length) return;
      try {
        await saveDeliveryRecipient(null);
      } catch (error) {
        // The checkout API already showed the failure; the switch stays as the buyer set it.
        logError('Failed to remove the recipient', {
          error,
          component: 'RecipientSection',
        });
      }
    },
    [data?.deliveryGroupIds.length, saveDeliveryRecipient]
  );

  /**
   * Saves the recipient of every group: updated where the group has it, added where not, by
   * the checkout as it is when the save starts (a recipient still being created is updated,
   * not created twice). The drawer closes once it is saved.
   */
  const handleContactSubmit = useCallback(
    (contactData: ContactForm) => {
      const recipient = {
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        middleName: contactData.middleName,
        phone: contactData.phone,
      };
      setKnownRecipient(recipient);
      return saveDeliveryRecipient(recipient);
    },
    [saveDeliveryRecipient]
  );

  const contact = useMemo<ContactForm | null>(
    () => (data ? (savedRecipient ?? knownRecipient ?? EMPTY_RECIPIENT) : null),
    [data, savedRecipient, knownRecipient]
  );

  if (!data) return null;

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
          data={contact}
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
