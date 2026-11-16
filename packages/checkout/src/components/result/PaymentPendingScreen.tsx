'use client';

import { Button, Result, Spin } from 'antd';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useRouter } from '@shopana/storefront/navigation';
import { useCheckoutTheme } from '#checkout/theme';
import { PlacementScreen } from '#checkout/components/result/PlacementScreen';

/**
 * Shown while the server settles the payment. Waiting has no limit (decision 1.9), so the buyer
 * can leave: the placement goes on on the server and is read again when the checkout is opened.
 */
export const PaymentPendingScreen = ({ brand }: { brand?: ReactNode }) => {
  const t = useTranslations('Checkout');
  const router = useRouter();
  const theme = useCheckoutTheme();
  const homePath = theme.useHomePath();
  const PaymentPending = theme.PaymentPending;
  if (PaymentPending) {
    return (
      <PaymentPending
        brand={brand}
        title={t('awaiting-payment-title')}
        description={t('awaiting-payment-description')}
        onGoHome={() => router.push(homePath)}
        labels={{ goHome: t('go-home') }}
      />
    );
  }
  return (
    <PlacementScreen brand={brand}>
      <Result
        icon={<Spin size="large" />}
        title={t('awaiting-payment-title')}
        subTitle={t('awaiting-payment-description')}
        extra={
          <Button type="link" onClick={() => router.push(homePath)}>
            {t('go-home')}
          </Button>
        }
      />
    </PlacementScreen>
  );
};
