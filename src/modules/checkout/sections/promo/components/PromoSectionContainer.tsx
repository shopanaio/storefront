'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import { useCheckoutPromoCode } from '@src/modules/checkout/hooks/useCheckoutPromoCodes';
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
   * Handles promo code submission
   */
  const handleApply = useCallback(
    (code: string) => {
      if (code.trim()) {
        publishValid({ code: code.trim() });
      } else {
        publishInvalid({ code: 'required' });
      }
    },
    [publishValid, publishInvalid]
  );

  /**
   * Handles promo code removal
   */
  const handleRemove = useCallback(() => {
    publishInvalid(undefined);
  }, [publishInvalid]);

  return (
    <PromoSectionView
      initialCode={initialCode}
      label={t('coupon-code')}
      applyText={t('apply')}
      removeText={t('remove')}
      onApply={handleApply}
      onRemove={handleRemove}
    />
  );
};

export default PromoSectionContainer;
