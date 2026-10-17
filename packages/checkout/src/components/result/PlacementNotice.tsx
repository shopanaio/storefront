'use client';

import { Alert, Button } from 'antd';
import { useTranslations } from 'next-intl';
import { usePlacementPhase, usePlacementStore } from '#checkout/state/placement/placementStore';
import { placementErrorMessageKey } from '#checkout/components/result/placementMessages';

/**
 * Placement problems that leave the checkout editable, shown above the submit button:
 * a failed payment (retry is always possible, decision 1.7), an unfinished provider payment,
 * and a rejected placement.
 */
export const PlacementNotice = () => {
  const t = useTranslations('Checkout');
  const phase = usePlacementPhase();
  const reset = usePlacementStore((state) => state.reset);

  switch (phase.name) {
    case 'payment-failed':
      return (
        <Alert
          type="error"
          showIcon
          closable
          onClose={reset}
          message={t('payment-failed')}
          description={phase.failure?.message || undefined}
        />
      );
    case 'payment-incomplete':
      return (
        <Alert
          type="warning"
          showIcon
          message={t('payment-incomplete')}
          action={
            <Button size="small" type="primary" href={phase.url}>
              {t('continue-payment')}
            </Button>
          }
        />
      );
    case 'rejected':
      return (
        <Alert
          type="error"
          showIcon
          closable
          onClose={reset}
          message={t(placementErrorMessageKey(phase.code))}
        />
      );
    default:
      return null;
  }
};
