'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';
import { onCheckoutEvent } from '@src/modules/checkout/state/checkoutBus';
import { CheckoutDataProvider } from '@src/modules/checkout/context/CheckoutDataContext';
import { CheckoutApiProvider } from '@src/modules/checkout/context/CheckoutApiContext';
import { CheckoutController } from '@src/modules/checkout/controller/CheckoutController';
import { CheckoutProgressBar } from './CheckoutProgressBar';
import { CheckoutView } from './CheckoutView';

interface Prop {
  cartId: string | null;
  onConfirm: () => void;
  brand?: React.ReactNode;
  /**
   * Optional feature flags controlling Checkout UI behavior.
   * - auth: when true, renders the Login button near the contact section.
   */
  features?: {
    /** Gate for rendering login button */
    auth?: boolean;
    /** Optional ISO country code to control which blocks are shown */
    country?: 'UA' | 'INTL';
  };
}

/**
 * Checkout container component - handles logic and state management.
 * Feature flags can adjust visible UI (e.g., `features.auth` shows login button).
 */
export const Checkout = ({ cartId, onConfirm, brand, features }: Prop) => {
  const t = useTranslations('Checkout');
  const [validationError, setValidationError] = useState<string | null>(null);

  const requestSubmit = useCheckoutStore((s) => s.requestSubmit);

  useEffect(() => {
    const offCompleted = onCheckoutEvent('submit/completed', () => {
      setValidationError(null);
      onConfirm();
    });

    const offBlocked = onCheckoutEvent('submit/blocked', ({ missing }) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestSubmit();
  };

  return (
    <CheckoutDataProvider cartId={cartId}>
      <CheckoutApiProvider>
        <CheckoutController />
        <CheckoutProgressBar />
        <CheckoutView
          brand={brand}
          features={features}
          validationError={validationError}
          onClearError={() => setValidationError(null)}
          onSubmit={handleSubmit}
          t={t}
        />
      </CheckoutApiProvider>
    </CheckoutDataProvider>
  );
};
