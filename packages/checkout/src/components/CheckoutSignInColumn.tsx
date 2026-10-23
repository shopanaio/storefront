'use client';

import { useTranslations } from 'next-intl';
import { CheckoutSection } from '#checkout/components/common/CheckoutSection';
import { SectionId } from '#checkout/state/interface';
import { sectionAnchor } from '#checkout/ui/focusAnchor';
import { CheckoutSignInRequired } from './CheckoutSignInRequired';

/**
 * The left column while the sign-in is required (A1–A2, S6): the sign-in takes the place of the
 * contact card, under its title, and of the other sections. It is out of the checkout form:
 * the sign-in brings forms of its own.
 */
export const CheckoutSignInColumn = () => {
  const t = useTranslations('Checkout');
  return (
    <CheckoutSection id={sectionAnchor(SectionId.Contact)} title={t('contact')}>
      <CheckoutSignInRequired />
    </CheckoutSection>
  );
};
