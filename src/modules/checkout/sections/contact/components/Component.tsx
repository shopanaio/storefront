'use client';

import { ContactSelect } from '@src/modules/checkout/components/contact/ContactSelect';
import type { ContactDto } from '@src/modules/checkout/core/contracts/dto';
import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useCheckoutCustomerIdentity } from '@src/modules/checkout/hooks/useCheckoutCustomerIdentity';
import { useMemo, useCallback } from 'react';

/**
 * View component for the checkout contact section.
 *
 * Pure controlled UI component that renders the contact form.
 * Receives generic form data and extracts needed fields.
 * Does not manage its own state - all state is controlled via props.
 *
 * @template TFormData - The form data type containing all form fields
 */
export interface ContactSectionViewProps<TFormData = ContactDto> {
  /** Current form data */
  value: TFormData | null;
  /** Called when form data is valid */
  onValid: (data: TFormData) => void;
  /** Called when form data is invalid */
  onInvalid: (errors?: Record<string, string>) => void;
}

export const ContactSectionView = ({
  value,
  onValid,
  onInvalid,
}: ContactSectionViewProps<ContactDto>) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const identity = useCheckoutCustomerIdentity();

  const initialValues = useMemo<Partial<ContactDto>>(
    () => ({
      userFirstName: value?.userFirstName || identity?.firstName,
      userLastName: value?.userLastName || identity?.lastName,
      userMiddleName: value?.userMiddleName || identity?.middleName,
      userPhone: value?.userPhone || identity?.phone,
    }),
    [value, identity]
  );

  const handleValid = useCallback(
    (dto: ContactDto) => {
      onValid(dto);
    },
    [onValid]
  );

  const handleInvalid = useCallback(
    (errors?: Record<string, string>) => {
      onInvalid(errors);
    },
    [onInvalid]
  );

  return (
    <Flex vertical gap={12} className={styles.container}>
      <ContactSelect
        initialValues={initialValues}
        onValid={handleValid}
        onInvalid={handleInvalid}
        title={t('contact')}
      />
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default ContactSectionView;
