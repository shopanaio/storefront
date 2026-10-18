'use client';

import { Button, Result } from 'antd';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { PlacementScreen } from '#checkout/components/result/PlacementScreen';

/** The checkout could not be loaded (decision 5.3): a message and a way to try again. */
export const CheckoutLoadError = ({
  brand,
  onRetry,
}: {
  brand?: ReactNode;
  onRetry: () => void;
}) => {
  const t = useTranslations('Checkout');
  return (
    <PlacementScreen brand={brand}>
      <Result
        status="warning"
        title={t('checkout-load-error')}
        extra={
          <Button type="primary" size="large" onClick={onRetry}>
            {t('retry')}
          </Button>
        }
      />
    </PlacementScreen>
  );
};
