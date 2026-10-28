'use client';

import { Button, Result, Spin } from 'antd';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useRouter } from '@shopana/storefront/navigation';
import { useCheckoutTheme } from '#checkout/theme';
import { PlacementScreen } from '#checkout/components/result/PlacementScreen';

/**
 * Shown while the buyer leaves for the provider or the server settles the payment. Waiting has
 * no limit (decision 1.9), so the buyer can leave: the placement goes on on the server and is
 * read again when the checkout is opened.
 */
export const PaymentPendingScreen = ({
  redirecting = false,
  brand,
}: {
  redirecting?: boolean;
  brand?: ReactNode;
}) => {
  const t = useTranslations('Checkout');
  const router = useRouter();
  const homePath = useCheckoutTheme().useHomePath();
  return (
    <PlacementScreen brand={brand}>
      <Result
        icon={<Spin size="large" />}
        title={t(
          redirecting ? 'redirecting-to-payment' : 'awaiting-payment-title'
        )}
        subTitle={redirecting ? null : t('awaiting-payment-description')}
        extra={
          redirecting ? null : (
            <Button type="link" onClick={() => router.push(homePath)}>
              {t('go-home')}
            </Button>
          )
        }
      />
    </PlacementScreen>
  );
};
