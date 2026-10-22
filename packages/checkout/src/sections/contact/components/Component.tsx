'use client';

import {
  ContactSelect,
  type ContactForm,
} from '#checkout/components/contact/ContactSelect';
import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { ContactFormData } from '../types';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';
import {
  useIsAuthenticated,
  useLoginMethod,
  useUser,
} from '@shopana/storefront-sdk/modules/session/react';

/**
 * View component for the checkout contact section.
 *
 * Pure controlled UI component that renders the contact form.
 * Receives generic form data and extracts needed fields.
 * Does not manage its own state - all state is controlled via props.
 */
export interface ContactSectionViewProps {
  /** Current form data */
  data: ContactFormData | null;
  /** Called to invalidate the section */
  invalidate: () => void;
}

export const ContactSectionView = ({ data }: ContactSectionViewProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const { updateCustomerIdentity } = useCheckoutApi();
  // A guest gives an email here; a signed-in buyer's email is the account's and is not edited.
  const withEmail = !useIsAuthenticated();
  // The identifier the buyer signed in with stays read-only (A3, A4).
  const loginMethod = useLoginMethod();
  const user = useUser();
  const lockedValue =
    loginMethod === 'phone' ? user?.phone : loginMethod === 'email' ? user?.email : null;
  const lockedIdentifier = useMemo(
    () => (loginMethod && lockedValue ? { method: loginMethod, value: lockedValue } : null),
    [loginMethod, lockedValue]
  );

  const onSubmit = useCallback(
    async (data: ContactForm) => {
      await updateCustomerIdentity({
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        phone: data.phone,
        ...(withEmail ? { email: data.email?.trim() || null } : {}),
      });
    },
    [updateCustomerIdentity, withEmail]
  );

  return (
    <Flex vertical gap={12} className={styles.container}>
      <ContactSelect
        data={data}
        title={t('contact')}
        onSubmit={onSubmit}
        withEmail={withEmail}
        lockedIdentifier={lockedIdentifier}
      />
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default ContactSectionView;
