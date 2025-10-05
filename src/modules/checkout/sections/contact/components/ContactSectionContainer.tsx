'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';
import type { ContactDto } from '@src/modules/checkout/core/contracts/dto';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import { useCheckoutCustomerIdentity } from '@src/modules/checkout/hooks/useCheckoutCustomerIdentity';
import { ContactSectionView } from './ContactSectionView';

/**
 * Container for the checkout contact section.
 *
 * Orchestrates integration with the section controller and identity.
 * Delegates all form logic and UI to ContactSectionView.
 */
export const ContactSectionContainer = () => {
  const t = useTranslations('Checkout');
  const identity = useCheckoutCustomerIdentity();

  const initialValues = useMemo<Partial<ContactDto>>(
    () => ({
      userFirstName: identity?.firstName,
      userLastName: identity?.lastName,
      userMiddleName: identity?.middleName,
      userPhone: identity?.phone,
    }),
    [identity?.firstName, identity?.lastName, identity?.middleName, identity?.phone]
  );

  const { publishValid, publishInvalid } = useSectionController<'contact'>(
    'contact',
    { required: true }
  );

  /**
   * Handles valid contact data from view
   */
  const handleValid = useCallback(
    (dto: ContactDto) => {
      publishValid(dto);
    },
    [publishValid]
  );

  /**
   * Handles invalid contact data from view
   */
  const handleInvalid = useCallback(
    (errors?: Record<string, string>) => {
      publishInvalid(errors);
    },
    [publishInvalid]
  );

  return (
    <ContactSectionView
      initialValues={initialValues}
      title={t('contact')}
      onValid={handleValid}
      onInvalid={handleInvalid}
    />
  );
};

export default ContactSectionContainer;
