import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  CheckoutEvent,
  onCheckoutEvent,
} from '@src/modules/checkout/state/checkoutBus';
import {
  computeMissingRequiredSections,
  useCheckoutStore,
} from '@src/modules/checkout/state/checkoutStore';

/**
 * Hook that manages validation alert state for the checkout form.
 * Listens to checkout events and returns props for rendering the validation alert.
 */
export const useValidationAlert = () => {
  const t = useTranslations('Checkout');
  const [validationError, setValidationError] = useState<string | null>(null);

  const buildMessage = (missing: Array<string>): string | null => {
    const sectionNameMap: Record<string, string> = {
      payment: t('payment'),
      contact: t('contact'),
      recipient: t('recipient'),
      address: t('address'),
      promo: t('promo'),
      comment: t('comment'),
      delivery: t('delivery'),
    };

    const mapSectionKey = (key: string): string => sectionNameMap[key] ?? key;
    const uniqueNames = Array.from(new Set(missing.map(mapSectionKey)));
    if (uniqueNames.length === 0) return null;
    return `${t('fill-required')}: ${uniqueNames.join(', ')}`;
  };

  useEffect(() => {
    const offCompleted = onCheckoutEvent(CheckoutEvent.SubmitCompleted, () => {
      setValidationError(null);
    });

    const offBlocked = onCheckoutEvent(
      CheckoutEvent.SubmitBlocked,
      ({ missing }) => {
        const message = buildMessage(missing as unknown as string[]);
        setValidationError(message ?? t('error-no-shipping-and-payment-method'));
      }
    );

    return () => {
      offCompleted();
      offBlocked();
    };
  }, [t]);

  // Adapt or hide validation alert as data changes and sections become valid/invalid
  useEffect(() => {
    if (validationError === null) return; // only adapt when alert is visible

    const unsubscribe = useCheckoutStore.subscribe((state) => {
      const missing = computeMissingRequiredSections(state);
      const nextMessage = buildMessage(missing as unknown as string[]);

      if (nextMessage === null) {
        setValidationError(null);
        return;
      }

      setValidationError(nextMessage);
    });

    return unsubscribe;
  }, [validationError, t]);

  return {
    validationError,
    onClearError: () => setValidationError(null),
  };
};
