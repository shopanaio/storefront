'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import { useCheckoutPromoCode } from '@src/modules/checkout/hooks/useCheckoutPromoCodes';
import type { PromoFormData } from '../types';
import { PromoSectionView } from './PromoSectionView';

/**
 * Container for the checkout promo section.
 *
 * Orchestrates integration with the section controller.
 * Delegates all form logic and UI to PromoSectionView.
 */
export const PromoSectionContainer = () => {
  const t = useTranslations('Checkout');
  const appliedPromoCode = useCheckoutPromoCode();

  const initialCode = useMemo(() => {
    return appliedPromoCode?.code ?? '';
  }, [appliedPromoCode?.code]);

  const { publishValid, publishInvalid } = useSectionController<'promo'>('promo', {
    required: false,
  });

  /**
   * Handles valid promo code data from view
   */
  const handleValid = useCallback(
    (data: PromoFormData) => {
      publishValid(data);
    },
    [publishValid]
  );

  /**
   * Handles invalid promo code data from view
   */
  const handleInvalid = useCallback(
    (errors?: Record<string, string>) => {
      publishInvalid(errors);
    },
    [publishInvalid]
  );

  return (
    <PromoSectionView
      initialCode={initialCode}
      label={t('coupon-code')}
      applyText={t('apply')}
      removeText={t('remove')}
      onValid={handleValid}
      onInvalid={handleInvalid}
    />
  );
};

export default PromoSectionContainer;
