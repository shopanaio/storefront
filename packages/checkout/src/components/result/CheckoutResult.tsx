'use client';

import { Button, Flex, Result, Skeleton } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useRouter } from '@shopana/storefront/next/navigation';
import {
  usePlacedOrderNumber,
  type PlacedOrderLoyalty,
} from '#checkout/hooks/usePlacedOrderNumber';
import { formatMoney } from '#checkout/ui/Money';
import { usePointsLabel } from '#checkout/sections/loyalty/format';
import { useCheckoutTheme } from '#checkout/theme';
import { PlacementScreen } from '#checkout/components/result/PlacementScreen';
import { paymentStatusMessageKey } from '#checkout/components/result/placementMessages';
import type { PlacementStatus } from '#checkout/state/placement/types';

export interface CheckoutResultProps {
  orderId: string | null;
  /** Number from the placement; when missing it is read from the order. */
  orderNumber: string | null;
  status: PlacementStatus;
  brand?: ReactNode;
}

/**
 * Result screen of an accepted order (decision 1.5): order number, payment status, what was paid
 * with loyalty and what the order earns, next steps.
 */
export const CheckoutResult = ({ orderId, orderNumber, status, brand }: CheckoutResultProps) => {
  const t = useTranslations('Checkout');
  const router = useRouter();
  const theme = useCheckoutTheme();
  const homePath = theme.useHomePath();
  const useOrderPath = theme.useOrderPath ?? noOrderPath;
  const themeOrderPath = useOrderPath(orderId ?? '');
  const orderPath = orderId ? themeOrderPath : null;
  const placed = usePlacedOrderNumber(orderId);
  const number = orderNumber ?? placed.number;
  const loading = !orderNumber && placed.loading;

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
              <strong>{t('order-number', { number })}</strong>
            ) : null}
            <span>{t(paymentStatusMessageKey(status))}</span>
            {placed.loyalty ? (
              <LoyaltyResult loyalty={placed.loyalty} status={status} />
            ) : null}
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

/** Statuses after which the loyalty tender is spent; before them it is only reserved. */
const SETTLED: PlacementStatus[] = ['PAID', 'AUTHORIZED', 'PAYMENT_NOT_REQUIRED'];

const LoyaltyResult = ({
  loyalty,
  status,
}: {
  loyalty: PlacedOrderLoyalty;
  status: PlacementStatus;
}) => {
  const t = useTranslations('Checkout');
  const locale = useLocale();
  const points = usePointsLabel();
  const { redemption, earning } = loyalty;
  const settled = SETTLED.includes(status);
  return (
    <Flex vertical gap={4} align="center">
      {redemption ? (
        <span>
          {redemption.source === 'POINTS' && redemption.points !== null
            ? t(settled ? 'result-loyalty-redeemed-points' : 'result-loyalty-reserved-points', {
                points: points(redemption.points),
                amount: formatMoney(locale, redemption.amount),
              })
            : t(
                settled
                  ? 'result-loyalty-redeemed-store-credit'
                  : 'result-loyalty-reserved-store-credit',
                { amount: formatMoney(locale, redemption.amount) }
              )}
        </span>
      ) : null}
      {redemption && !settled ? (
        <span>{t('result-loyalty-reserved-description')}</span>
      ) : null}
      {earning && earning.status !== 'REVERSED' ? (
        <>
          <strong>
            {BigInt(earning.points) > 0n
              ? t('result-loyalty-earned-points', { points: points(earning.points) })
              : null}
            {BigInt(earning.points) > 0n && earning.amount ? ' · ' : null}
            {earning.amount
              ? t('result-loyalty-earned-store-credit', {
                  amount: formatMoney(locale, earning.amount),
                })
              : null}
          </strong>
          {earning.status === 'PENDING' ? (
            <span>{t('result-loyalty-earned-pending')}</span>
          ) : null}
        </>
      ) : null}
    </Flex>
  );
};

function noOrderPath(): string | null {
  return null;
}
