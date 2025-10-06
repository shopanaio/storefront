import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckoutEvent, onCheckoutEvent } from '@src/modules/checkout/state/checkoutBus';

/**
 * Hook that manages validation alert state for the checkout form.
 * Listens to checkout events and returns props for rendering the validation alert.
 */
export const useValidationAlert = (onConfirm: () => void) => {
  const t = useTranslations('Checkout');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const offCompleted = onCheckoutEvent(CheckoutEvent.SubmitCompleted, () => {
      setValidationError(null);
      onConfirm();
    });

    const offBlocked = onCheckoutEvent(CheckoutEvent.SubmitBlocked, ({ missing }) => {
      /**
       * Maps section keys to their translated display names.
       * Handles both exact matches and prefixed keys (e.g., 'delivery:*').
       */
      const sectionNameMap: Record<string, string> = {
        payment: t('payment'),
        contact: t('contact'),
        recipient: t('recipient'),
        address: t('address'),
        promo: t('promo'),
        comment: t('comment'),
      };

      const mapSectionKey = (key: string): string => {
        if (key.startsWith('delivery:')) {
          return t('delivery');
        }
        return sectionNameMap[key] ?? key;
      };

      const uniqueNames = Array.from(new Set(missing.map(mapSectionKey)));
      const message =
        uniqueNames.length > 0
          ? `${t('fill-required')}: ${uniqueNames.join(', ')}`
          : t('error-no-shipping-and-payment-method');

      setValidationError(message);
    });

    return () => {
      offCompleted();
      offBlocked();
    };
  }, [onConfirm, t]);

  return {
    validationError,
    onClearError: () => setValidationError(null),
  };
};
