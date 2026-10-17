'use client';

import { Button, Flex, Result, Skeleton } from 'antd';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useRouter } from '@shopana/storefront/next/navigation';
import { usePlacedOrderNumber } from '#checkout/hooks/usePlacedOrderNumber';
import { useCheckoutTheme } from '#checkout/theme';
import { PlacementScreen } from '#checkout/components/result/PlacementScreen';
import { paymentStatusMessageKey } from '#checkout/components/result/placementMessages';
import type { PlacementStatus } from '#checkout/state/placement/types';

export interface CheckoutResultProps {
  orderId: string | null;
  status: PlacementStatus;
  brand?: ReactNode;
}

/** Result screen of an accepted order (decision 1.5): order number, payment status, next steps. */
export const CheckoutResult = ({ orderId, status, brand }: CheckoutResultProps) => {
  const t = useTranslations('Checkout');
  const router = useRouter();
  const theme = useCheckoutTheme();
  const homePath = theme.useHomePath();
  const useOrderPath = theme.useOrderPath ?? noOrderPath;
  const themeOrderPath = useOrderPath(orderId ?? '');
  const orderPath = orderId ? themeOrderPath : null;
  const { number, loading } = usePlacedOrderNumber(orderId);

  return (
    <PlacementScreen brand={brand}>
      <Result
        status="success"
        title={t('order-placed-title')}
        subTitle={
          <Flex vertical gap={4} align="center">
            {loading ? (
              <Skeleton.Input active size="small" />
            ) : number !== null ? (
              <strong>{t('order-number', { number: String(number) })}</strong>
            ) : null}
            <span>{t(paymentStatusMessageKey(status))}</span>
          </Flex>
        }
        extra={
          <Flex vertical gap={12} align="center">
            {orderPath ? (
              <Button type="primary" size="large" onClick={() => router.push(orderPath)}>
                {t('view-order')}
              </Button>
            ) : null}
            <Button
              type={orderPath ? 'default' : 'primary'}
              size="large"
              onClick={() => router.push(homePath)}
            >
              {t('go-home')}
            </Button>
          </Flex>
        }
      />
    </PlacementScreen>
  );
};

function noOrderPath(): string | null {
  return null;
}
