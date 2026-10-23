'use client';

import {
  ContactSelect,
  type ContactForm,
} from '#checkout/components/contact/ContactSelect';
import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { useLoginIdentifier } from '@shopana/storefront-auth/ui';
import { useIsAuthenticated } from '@shopana/storefront-sdk/modules/session/react';
import { ContactFormData } from '../types';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';

export interface ContactSectionViewProps {
  /** The contact saved on the checkout. */
  data: ContactFormData | null;
  /** Called to invalidate the section */
  invalidate: () => void;
}

/**
 * The contact section: the buyer's name, phone and, for a guest, email, edited in a drawer and
 * saved to the checkout by `updateCustomerIdentity`. A signed-in buyer's email is the
 * account's, and the identifier they signed in with is shown read-only (A3, A4).
 */
export const ContactSectionView = ({ data }: ContactSectionViewProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const { updateCustomerIdentity } = useCheckoutApi();
  // A guest gives an email here; a signed-in buyer's email is the account's and is not edited.
  const withEmail = !useIsAuthenticated();
  // The identifier the buyer signed in with stays read-only (A3, A4).
  const lockedIdentifier = useLoginIdentifier();

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
