'use client';

import { ContactSelect } from '@src/modules/checkout/components/contact/ContactSelect';
import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useCheckoutCustomerIdentity } from '@src/modules/checkout/hooks/useCheckoutCustomerIdentity';
import { useCallback, useMemo } from 'react';
import { ContactFormData } from '../types';
import { useCheckoutApi } from '@src/modules/checkout/context/CheckoutApiContext';

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

  const onSubmit = useCallback(
    async (data: ContactFormData) => {
      await updateCustomerIdentity({
        phone: data.userPhone,
      });
    },
    [updateCustomerIdentity]
  );

  return (
    <Flex vertical gap={12} className={styles.container}>
      <ContactSelect
        initialValues={data}
        title={t('contact')}
        onSubmit={onSubmit}
      />
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default ContactSectionView;
