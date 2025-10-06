'use client';

import { ContactSelect } from '@src/modules/checkout/components/contact/ContactSelect';
import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useCheckoutCustomerIdentity } from '@src/modules/checkout/hooks/useCheckoutCustomerIdentity';
import { useMemo } from 'react';
import { ContactFormData } from '../types';
import type { AnySchema } from 'yup';

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
  /** Called when form data is valid */
  onValid: () => void;
  /** Called when form data is invalid */
  onInvalid: (errors?: Record<string, string>) => void;
  /** Validation schema */
  schema: AnySchema;
}

export const ContactSectionView = ({
  data,
  onValid,
  onInvalid,
}: ContactSectionViewProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const identity = useCheckoutCustomerIdentity();

  const initialValues = useMemo<Partial<ContactFormData>>(
    () => ({
      userFirstName: data?.userFirstName || identity?.firstName,
      userLastName: data?.userLastName || identity?.lastName,
      userMiddleName: data?.userMiddleName || identity?.middleName,
      userPhone: data?.userPhone || identity?.phone,
    }),
    [data, identity]
  );

  return (
    <Flex vertical gap={12} className={styles.container}>
      <ContactSelect
        initialValues={initialValues}
        onValid={onValid}
        onInvalid={onInvalid}
        title={t('contact')}
      />
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default ContactSectionView;
