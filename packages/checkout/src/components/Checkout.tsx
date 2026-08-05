'use client';

import { useTranslations } from 'next-intl';
import { useCheckoutStore } from '#checkout/state/checkoutStore';
import { CheckoutApiProvider } from '#checkout/context/CheckoutApiContext';
import { useValidationAlert } from '#checkout/hooks/useValidationAlert';
import { CheckoutProgressBar } from './CheckoutProgressBar';
import { CheckoutView } from './CheckoutView';
import { CheckoutController } from '#checkout/components/CheckoutController';
import { CheckoutDataContextProvider } from '#checkout/context/CheckoutDataContext';
import { CheckoutThemeProvider } from '#checkout/theme';
import type { CheckoutThemeAdapter } from '#checkout/theme';

export interface CheckoutProps {
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
  theme: CheckoutThemeAdapter;
}

/**
 * Checkout container component - handles logic and state management.
 * Feature flags can adjust visible UI (e.g., `features.auth` shows login button).
 */
export const Checkout = ({
  cartId,
  onConfirm,
  brand,
  features,
  theme,
}: CheckoutProps) => {
  const t = useTranslations('Checkout');
  const requestSubmit = useCheckoutStore((s) => s.requestSubmit);
  const { validationError, onClearError } = useValidationAlert();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestSubmit();
  };

  return (
    <CheckoutThemeProvider theme={theme}>
      <CheckoutDataContextProvider checkoutId={cartId}>
        <CheckoutApiProvider>
          <CheckoutController onConfirm={onConfirm} />
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
      </CheckoutDataContextProvider>
    </CheckoutThemeProvider>
  );
};
