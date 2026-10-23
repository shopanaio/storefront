'use client';

import { useEffect } from 'react';
import { useCheckoutStore } from '#checkout/state/checkoutStore';
import { CheckoutApiProvider } from '#checkout/context/CheckoutApiContext';
import { CheckoutProgressBar } from './CheckoutProgressBar';
import { CheckoutView } from './CheckoutView';
import { CheckoutController } from '#checkout/components/CheckoutController';
import { CheckoutDataContextProvider } from '#checkout/context/CheckoutDataContext';
import { CheckoutProviders } from './CheckoutProviders';
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
import { useSignInRequired } from '#checkout/hooks/useSignInRequired';
import { CheckoutSignInProvider } from './CheckoutSignInProvider';

export interface CheckoutProps {
  cartId: string | null;
  /**
   * Called once the order is placed and accepted (decision 1.6): the host clears the cart here.
   * The checkout then shows its result screen unless the host navigates away.
   */
  onOrderAccepted: (event: OrderAcceptedEvent) => void;
  brand?: React.ReactNode;
  /**
   * What the theme changes; the checkout works without it. Its `customerAccountsEnabled` is the
   * switch of the sign-in in the checkout.
   */
  theme?: CheckoutThemeAdapter;
}

/**
 * Checkout container component - handles logic and state management.
 */
export const Checkout = ({
  cartId,
  onOrderAccepted,
  brand,
  theme,
}: CheckoutProps) => {
  const resetPlacement = usePlacementStore((s) => s.reset);
  const resetBanners = useBannerStore((s) => s.reset);

  // The placement phase outlives cart cleanup, so it is reset only when the checkout unmounts.
  useEffect(() => resetPlacement, [resetPlacement]);
  // Failed saves and closed banners belong to one checkout: a renewal or another cart drops them.
  useEffect(() => resetBanners, [resetBanners, cartId]);

  return (
    <CheckoutProviders theme={theme}>
      <CheckoutDataContextProvider checkoutId={cartId}>
        <CheckoutApiProvider>
          <CheckoutController
            checkoutId={cartId}
            onOrderAccepted={onOrderAccepted}
          />
          <CheckoutBody checkoutId={cartId} brand={brand} />
        </CheckoutApiProvider>
      </CheckoutDataContextProvider>
    </CheckoutProviders>
  );
};

const CheckoutBody = ({
  checkoutId,
  brand,
}: Pick<CheckoutProps, 'brand'> & {
  checkoutId: string | null;
}) => {
  const requestSubmit = useCheckoutStore((s) => s.requestSubmit);
  const phase = usePlacementPhase();
  const { checkout, error, refetch } = useCheckoutData();
  const notFound = useCheckoutNotFound(checkoutId);
  const signInRequired = useSignInRequired(checkoutId);

  if (phase.name === 'accepted') {
    return (
      <CheckoutResult
        orderId={phase.orderId}
        orderNumber={phase.orderNumber}
        status={phase.status}
        paymentFlow={phase.paymentFlow}
        earningEstimate={phase.earningEstimate}
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
    !signInRequired &&
    error &&
    !checkout &&
    !notFound &&
    phase.name === 'idle'
  ) {
    return <CheckoutLoadError brand={brand} onRetry={() => void refetch()} />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestSubmit();
  };

  return (
    // The one sign-in of the page: the drawer, or the form in place of the contact.
    <CheckoutSignInProvider required={signInRequired}>
      <CheckoutProgressBar />
      <CheckoutView brand={brand} onSubmit={handleSubmit} />
    </CheckoutSignInProvider>
  );
};
