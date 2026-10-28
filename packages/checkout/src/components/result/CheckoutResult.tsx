'use client';

import { Button, Flex, Result, Skeleton } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useRouter } from '@shopana/storefront/navigation';
import {
  usePlacedOrderNumber,
  type PlacedOrderLoyalty,
} from '#checkout/hooks/usePlacedOrderNumber';
import { formatMoney } from '#checkout/ui/Money';
import { usePointsLabel } from '#checkout/sections/loyalty/format';
import { useCheckoutTheme } from '#checkout/theme';
import { PlacementScreen } from '#checkout/components/result/PlacementScreen';
import { paymentStatusMessageKey } from '#checkout/components/result/placementMessages';
import type {
  PaymentFlow,
  PlacementStatus,
} from '#checkout/state/placement/types';
import type { Checkout } from '#checkout/types/entity';
import { useHeldPending } from '#checkout/ui/LoadingBoundary';
import { LoyaltyIcon } from '#checkout/sections/loyalty/components/LoyaltyIcon';

export interface CheckoutResultProps {
  orderId: string | null;
  /** Number from the placement; when missing it is read from the order. */
  orderNumber: string | null;
  status: PlacementStatus;
  /** Flow of the payment; `null` when unknown. */
  paymentFlow?: PaymentFlow | null;
  /** The checkout's estimate of the earning, shown until the order's earning is readable. */
  earningEstimate?: Checkout.LoyaltyEarning | null;
  brand?: ReactNode;
}

/**
 * Result screen of an accepted order (decision 1.5): order number, payment status, what was paid
 * with loyalty and what the order earns, next steps.
 */
export const CheckoutResult = ({
  orderId,
  orderNumber,
  status,
  paymentFlow = null,
  earningEstimate = null,
  brand,
}: CheckoutResultProps) => {
  const t = useTranslations('Checkout');
  const router = useRouter();
  const theme = useCheckoutTheme();
  const homePath = theme.useHomePath();
  const useOrderPath = theme.useOrderPath;
  const themeOrderPath = useOrderPath(orderId ?? '');
  const orderPath = orderId ? themeOrderPath : null;
  const placed = usePlacedOrderNumber(orderId);
  const number = orderNumber ?? placed.number;
  const loading = useHeldPending(!orderNumber && placed.loading);

  return (
    <PlacementScreen brand={brand}>
      <Result
        status="success"
        title={t('order-placed-title')}
        subTitle={
          <Flex vertical gap={4} align="center">
            {loading ? (
              <Skeleton.Input size="small" />
            ) : number !== null ? (
              <strong>{t('order-number', { number })}</strong>
            ) : null}
            <span>{t(paymentStatusMessageKey(status))}</span>
            <LoyaltyResult
              loyalty={placed.loyalty}
              settled={loyaltySpent(status, paymentFlow)}
              estimate={earningEstimate}
            />
          </Flex>
        }
        extra={
          <Flex vertical gap={12} align="center">
            {orderPath ? (
              <Button
                type="primary"
                size="large"
                onClick={() => router.push(orderPath)}
              >
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

/**
 * Whether placing the order spent the loyalty tender: placement commits it once the payment is
 * authorized or captured, when nothing is to be paid, and when cash on delivery is accepted.
 * Before that it is only reserved.
 */
export function loyaltySpent(
  status: PlacementStatus,
  paymentFlow: PaymentFlow | null
): boolean {
  if (
    status === 'PAID' ||
    status === 'AUTHORIZED' ||
    status === 'PAYMENT_NOT_REQUIRED'
  ) {
    return true;
  }
  return status === 'PAYMENT_PENDING' && paymentFlow === 'ON_DELIVERY';
}

const LoyaltyResult = ({
  loyalty,
  settled,
  estimate,
}: {
  loyalty: PlacedOrderLoyalty | null;
  settled: boolean;
  estimate: Checkout.LoyaltyEarning | null;
}) => {
  const t = useTranslations('Checkout');
  const locale = useLocale();
  const points = usePointsLabel();
  const redemption = loyalty?.redemption ?? null;
  const earning = loyalty?.earning ?? null;
  // Until Loyalty records the order's earning, the checkout's estimate stands in for it.
  const estimated =
    !earning && estimate?.state === 'AVAILABLE' ? estimate : null;
  if (!redemption && !earning && !estimated) return null;
  return (
    <Flex vertical gap={4} align="center">
      {redemption ? (
        <span>
          {redemption.source === 'POINTS' && redemption.points !== null
            ? t(
                settled
                  ? 'result-loyalty-redeemed-points'
                  : 'result-loyalty-reserved-points',
                {
                  points: points(redemption.points),
                  amount: formatMoney(locale, redemption.amount),
                }
              )
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
              ? t('result-loyalty-earned-points', {
                  points: points(earning.points),
                })
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
      {estimated ? (
        <Flex align="center" gap={6}>
          <LoyaltyIcon size={16} />
          <span>{estimated.headline}</span>
        </Flex>
      ) : null}
    </Flex>
  );
};
