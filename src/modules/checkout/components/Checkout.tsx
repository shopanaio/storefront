'use client';

import { useTranslations } from 'next-intl';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';
import { CheckoutDataProvider } from '@src/modules/checkout/context/CheckoutDataContext';
import { CheckoutApiProvider } from '@src/modules/checkout/context/CheckoutApiContext';
import { CheckoutController } from '@src/modules/checkout/controller/CheckoutController';
import { useValidationAlert } from '@src/modules/checkout/hooks/useValidationAlert';
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
  const requestSubmit = useCheckoutStore((s) => s.requestSubmit);
  const { validationError, onClearError } = useValidationAlert(onConfirm);

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
          onClearError={onClearError}
          onSubmit={handleSubmit}
          t={t}
        />
      </CheckoutApiProvider>
    </CheckoutDataProvider>
  );
};
