import { Button, Flex, Result } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@shopana/storefront/next/navigation';
import useCartId from '@shopana/storefront-sdk/modules/cart/react/hooks/useCartId';
import { useDefaultCartCleanup } from '#checkout/hooks/useDefaultCartCleanup';
import { CheckoutThemeProvider, useCheckoutTheme } from '#checkout/theme';
import type { CheckoutThemeAdapter } from '#checkout/theme';
import { createAttemptJournal } from '#checkout/state/placement/attemptJournal';
import {
  pollPlacement,
  readReturnParams,
  resolveRecoveryLocator,
  stripReturnToken,
  useReadPlacement,
} from '#checkout/state/placement/recovery';
import type { ReturnParams } from '#checkout/state/placement/recovery';
import { phaseForOutcome, recordOutcome } from '#checkout/state/placement/transitions';
import type { PlacementPhase } from '#checkout/state/placement/placementStore';
import type { OrderAcceptedEvent } from '#checkout/state/checkoutBus';
import { CheckoutResult } from '#checkout/components/result/CheckoutResult';
import { PaymentPendingScreen } from '#checkout/components/result/PaymentPendingScreen';
import { PlacementScreen } from '#checkout/components/result/PlacementScreen';
import { placementErrorMessageKey } from '#checkout/components/result/placementMessages';

type ReturnView = PlacementPhase | { name: 'loading' };

/**
 * Return page of the payment provider (`/checkout/return`, plan section 2): reads the placement
 * named by the URL (placement id and token) or by the attempt journal, removes the token from
 * the address bar, and follows the placement to its outcome.
 */
export interface CheckoutReturnPageProps {
  theme: CheckoutThemeAdapter;
  /**
   * Called after the cart of an accepted order was cleared, so that the host clears its own
   * cart-related state too (for example a box builder kept in localStorage).
   */
  onOrderAccepted?: (event: OrderAcceptedEvent) => void;
}

export const CheckoutReturnPageClient = ({ theme, onOrderAccepted }: CheckoutReturnPageProps) => (
  <CheckoutThemeProvider theme={theme}>
    <CheckoutReturn onOrderAccepted={onOrderAccepted} />
  </CheckoutThemeProvider>
);

const CheckoutReturn = ({
  onOrderAccepted,
}: Pick<CheckoutReturnPageProps, 'onOrderAccepted'>) => {
  const t = useTranslations('Checkout');
  const theme = useCheckoutTheme();
  const Brand = theme.Brand;
  const router = useRouter();
  const homePath = theme.useHomePath();
  const checkoutPath = theme.useCheckoutPath();
  const readPlacement = useReadPlacement();
  const cleanup = useDefaultCartCleanup();
  const { cartId, loaded } = useCartId();
  const [view, setView] = useState<ReturnView>({ name: 'loading' });
  const startedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const paramsRef = useRef<ReturnParams | null>(null);
  const latest = useRef({ cartId, cleanup, readPlacement, onOrderAccepted });
  useEffect(() => {
    latest.current = { cartId, cleanup, readPlacement, onOrderAccepted };
  });

  // Runs once, when the cart cookie is known; polling stops only when the page unmounts.
  useEffect(() => {
    if (!loaded || startedRef.current) return;
    startedRef.current = true;

    // Read once: the token is gone from the address bar after the first read.
    paramsRef.current ??= readReturnParams(window.location.search);
    stripReturnToken(window.location, window.history);
    const params = paramsRef.current;
    const journal = createAttemptJournal();
    const attempt = journal.read(params.checkoutId);
    const locator = resolveRecoveryLocator(params, attempt);
    if (!locator) {
      setView({ name: 'rejected', code: 'CHECKOUT_PLACEMENT_NOT_FOUND' });
      return;
    }

    const controller = new AbortController();
    void pollPlacement({
      read: (target) => latest.current.readPlacement(target),
      locator,
      flow: attempt?.paymentFlow ?? null,
      signal: controller.signal,
      onResult: (result, outcome) => {
        if (outcome.kind === 'awaiting-payment') {
          setView({ name: 'awaiting-payment' });
          return;
        }
        if (attempt) {
          recordOutcome(journal, attempt, result, outcome);
        }
        if (outcome.kind === 'accepted') {
          // A read by the token alone does not name the checkout; the URL does.
          const checkoutId = attempt?.checkoutId ?? result.checkoutId ?? params.checkoutId;
          // Only the cart this order was placed from is cleared (decision 1.6).
          if (checkoutId && checkoutId === latest.current.cartId) {
            latest.current.cleanup(checkoutId);
            latest.current.onOrderAccepted?.({
              checkoutId,
              orderId: outcome.orderId,
              orderNumber: outcome.orderNumber,
              status: outcome.status,
            });
          }
        }
        setView(phaseForOutcome(outcome, 'recover'));
      },
      onMissing: () => {
        setView({ name: 'rejected', code: 'CHECKOUT_PLACEMENT_NOT_FOUND' });
      },
    });
    abortRef.current = controller;
  }, [loaded]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      abortRef.current = null;
      startedRef.current = false;
    },
    []
  );

  const brand = <Brand />;
  const backToCheckout = (
    <Button size="large" onClick={() => router.replace(checkoutPath)}>
      {t('back-to-checkout')}
    </Button>
  );

  switch (view.name) {
    case 'accepted':
      return (
        <CheckoutResult
          orderId={view.orderId}
          orderNumber={view.orderNumber}
          status={view.status}
          brand={brand}
        />
      );
    case 'payment-failed':
      return (
        <PlacementScreen brand={brand}>
          <Result
            status="error"
            title={t('payment-failed')}
            subTitle={view.failure?.message || null}
            extra={
              <Button type="primary" size="large" onClick={() => router.replace(checkoutPath)}>
                {t('retry-payment')}
              </Button>
            }
          />
        </PlacementScreen>
      );
    case 'payment-incomplete':
      return (
        <PlacementScreen brand={brand}>
          <Result
            status="warning"
            title={t('payment-incomplete')}
            extra={
              <Flex vertical gap={12} align="center">
                <Button type="primary" size="large" href={view.url}>
                  {t('continue-payment')}
                </Button>
                {backToCheckout}
              </Flex>
            }
          />
        </PlacementScreen>
      );
    case 'rejected':
      return (
        <PlacementScreen brand={brand}>
          <Result
            status="info"
            title={t(placementErrorMessageKey(view.code))}
            extra={
              <Flex vertical gap={12} align="center">
                {backToCheckout}
                <Button type="link" onClick={() => router.replace(homePath)}>
                  {t('go-home')}
                </Button>
              </Flex>
            }
          />
        </PlacementScreen>
      );
    case 'client-sdk':
    case 'redirecting':
    case 'idle':
    case 'placing':
      // The checkout page resumes these from the attempt journal.
      return (
        <PlacementScreen brand={brand}>
          <Result status="info" title={t('payment-incomplete')} extra={backToCheckout} />
        </PlacementScreen>
      );
    case 'loading':
    case 'awaiting-payment':
      return <PaymentPendingScreen brand={brand} />;
  }
};
