'use client';

import { Alert, Button } from 'antd';
import { useTranslations } from 'next-intl';
import { usePlacementPhase, usePlacementStore } from '#checkout/state/placement/placementStore';
import { placementErrorMessageKey } from '#checkout/components/result/placementMessages';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { useDefaultCartCleanup } from '#checkout/hooks/useDefaultCartCleanup';

/**
 * Placement problems that leave the checkout editable, shown above the submit button:
 * a failed payment (retry is always possible, decision 1.7), an unfinished provider payment,
 * and a rejected placement.
 */
export const PlacementNotice = () => {
  const t = useTranslations('Checkout');
  const phase = usePlacementPhase();
  const reset = usePlacementStore((state) => state.reset);
  const { checkout } = useCheckoutData();
  const cleanup = useDefaultCartCleanup();

  switch (phase.name) {
    case 'payment-failed':
      return (
        <Alert
          type="error"
          showIcon
          closable
          onClose={reset}
          title={t('payment-failed')}
          description={phase.failure?.message || undefined}
        />
      );
    case 'payment-incomplete':
      return (
        <Alert
          type="warning"
          showIcon
          title={t('payment-incomplete')}
          action={
            <Button size="small" type="primary" href={phase.url}>
              {t('continue-payment')}
            </Button>
          }
        />
      );
    case 'rejected':
      if (phase.code === 'CHECKOUT_ALREADY_PLACED') {
        // Placed elsewhere (another tab or device): this cart can no longer be used, and a
        // reload shows the same. The buyer leaves it; the page then goes home without a cart.
        return (
          <Alert
            type="warning"
            showIcon
            title={t(placementErrorMessageKey(phase.code))}
            action={
              <Button size="small" type="primary" onClick={() => cleanup(checkout?.id ?? null)}>
                {t('go-home')}
              </Button>
            }
          />
        );
      }
      return (
        <Alert
          type="error"
          showIcon
          closable
          onClose={reset}
          title={t(placementErrorMessageKey(phase.code))}
        />
      );
    default:
      return null;
  }
};
