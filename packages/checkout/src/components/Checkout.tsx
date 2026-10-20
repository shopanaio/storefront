'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCheckoutStore } from '#checkout/state/checkoutStore';
import { CheckoutApiProvider } from '#checkout/context/CheckoutApiContext';
import { CheckoutProgressBar } from './CheckoutProgressBar';
import { CheckoutView } from './CheckoutView';
import { CheckoutController } from '#checkout/components/CheckoutController';
import { CheckoutDataContextProvider } from '#checkout/context/CheckoutDataContext';
import { CheckoutThemeProvider } from '#checkout/theme';
import type { CheckoutThemeAdapter } from '#checkout/theme';
import type { OrderAcceptedEvent } from '#checkout/state/checkoutBus';
import {
  usePlacementPhase,
  usePlacementStore,
} from '#checkout/state/placement/placementStore';
import { CheckoutResult } from '#checkout/components/result/CheckoutResult';
import { PaymentPendingScreen } from '#checkout/components/result/PaymentPendingScreen';
import { CheckoutLoadError } from '#checkout/components/CheckoutLoadError';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { useCheckoutNotFound } from '#checkout/hooks/useCheckoutNotFound';
import { useBannerStore } from '#checkout/state/banners/bannerStore';
import { CheckoutSignInRequired } from '#checkout/components/CheckoutSignInRequired';
import {
  useSessionExpired,
  useSessionStatus,
} from '@shopana/storefront-sdk/modules/session/react';

export interface CheckoutProps {
  cartId: string | null;
  /**
   * Called once the order is placed and accepted (decision 1.6): the host clears the cart here.
   * The checkout then shows its result screen unless the host navigates away.
   */
  onOrderAccepted: (event: OrderAcceptedEvent) => void;
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
  onOrderAccepted,
  brand,
  features,
  theme,
}: CheckoutProps) => {
  const resetPlacement = usePlacementStore((s) => s.reset);
  const resetBanners = useBannerStore((s) => s.reset);

  // The placement phase outlives cart cleanup, so it is reset only when the checkout unmounts.
  useEffect(() => resetPlacement, [resetPlacement]);
  // Failed saves and closed banners belong to one checkout: a renewal or another cart drops them.
  useEffect(() => resetBanners, [resetBanners, cartId]);

  return (
    <CheckoutThemeProvider theme={theme}>
      <CheckoutDataContextProvider checkoutId={cartId}>
        <CheckoutApiProvider>
          <CheckoutController
            checkoutId={cartId}
            onOrderAccepted={onOrderAccepted}
          />
          <CheckoutBody checkoutId={cartId} brand={brand} features={features} />
        </CheckoutApiProvider>
      </CheckoutDataContextProvider>
    </CheckoutThemeProvider>
  );
};

const CheckoutBody = ({
  checkoutId,
  brand,
  features,
}: Pick<CheckoutProps, 'brand' | 'features'> & { checkoutId: string | null }) => {
  const t = useTranslations('Checkout');
  const requestSubmit = useCheckoutStore((s) => s.requestSubmit);
  const phase = usePlacementPhase();
  const { checkout, error, refetch } = useCheckoutData();
  const notFound = useCheckoutNotFound(checkoutId);
  const sessionStatus = useSessionStatus();
  const sessionExpired = useSessionExpired();

  if (phase.name === 'accepted') {
    return (
      <CheckoutResult
        orderId={phase.orderId}
        orderNumber={phase.orderNumber}
        status={phase.status}
        brand={brand}
      />
    );
  }
  if (phase.name === 'awaiting-payment' || phase.name === 'redirecting') {
    return (
      <PaymentPendingScreen
        redirecting={phase.name === 'redirecting'}
        brand={brand}
      />
    );
  }

  if (
    phase.name === 'idle' &&
    sessionExpired &&
    !checkout &&
    (notFound || !checkoutId)
  ) {
    return <CheckoutSignInRequired brand={brand} reason="expired" />;
  }
  if (
    phase.name === 'idle' &&
    checkout &&
    !checkout.guestCheckoutAllowed &&
    sessionStatus !== 'authenticated'
  ) {
    return <CheckoutSignInRequired brand={brand} reason="required" />;
  }

  if (error && !checkout && !notFound && phase.name === 'idle') {
    return <CheckoutLoadError brand={brand} onRetry={() => void refetch()} />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestSubmit();
  };

  return (
    <>
      <CheckoutProgressBar />
      <CheckoutView
        brand={brand}
        features={features}
        onSubmit={handleSubmit}
        t={t}
      />
    </>
  );
};
