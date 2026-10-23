import { useEffect, useEffectEvent } from 'react';
import { useQuery } from '@apollo/client/react';
import type { model } from '@shopana/storefront-sdk';
import { placedOrderQuery } from '#checkout/api/queries/placedOrderQuery.shopana';
import type { StorefrontPlacedOrderQuery } from '#checkout/graphql/operations';

/** Loyalty of a placed order: what was paid with it and what it earns. */
export interface PlacedOrderLoyalty {
  redemption: {
    source: 'POINTS' | 'STORE_CREDIT';
    points: string | null;
    amount: model.Money;
  } | null;
  earning: {
    points: string;
    amount: model.Money | null;
    status: 'PENDING' | 'AVAILABLE' | 'REVERSED';
  } | null;
}

type ApiOrder = NonNullable<StorefrontPlacedOrderQuery['order']>;

const toMoney = (money: {
  amount: string;
  currencyCode: string;
}): model.Money => ({
  amount: Number(money.amount) || 0,
  currencyCode: money.currencyCode,
});

function mapLoyalty(order: ApiOrder): PlacedOrderLoyalty {
  const { loyaltyRedemption: redemption, loyaltyEarning: earning } = order;
  return {
    redemption: redemption
      ? {
          source: redemption.source,
          points: redemption.points ?? null,
          amount: toMoney(redemption.amount),
        }
      : null,
    earning:
      earning && (BigInt(earning.points) > 0n || earning.amount)
        ? {
            points: earning.points,
            amount: earning.amount ? toMoney(earning.amount) : null,
            status: earning.status,
          }
        : null,
  };
}

/** Loyalty records the earning of an order after it is placed: it is read once more then. */
export const EARNING_REFETCH_DELAY_MS = 4_000;

/**
 * Human-readable number and loyalty of a placed order; `null` until loaded or when the order is
 * unreadable. A failing loyalty field does not hide the number. Right after placement the order
 * has no earning yet: it is read once more a moment later.
 */
export function usePlacedOrderNumber(orderId: string | null): {
  number: string | null;
  loyalty: PlacedOrderLoyalty | null;
  loading: boolean;
} {
  const { data, loading, refetch } = useQuery(placedOrderQuery, {
    variables: { orderId: orderId ?? '' },
    skip: !orderId,
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });
  const order = data?.order ?? null;
  const placedOrderId = order?.id ?? null;
  const awaitingEarning = order !== null && !order.loyaltyEarning;
  const isAwaitingEarning = useEffectEvent(() => awaitingEarning);
  const refetchOrder = useEffectEvent(() => {
    void refetch().catch(() => undefined);
  });
  // Once per order: a second empty answer means the order earns nothing (yet).
  useEffect(() => {
    if (!placedOrderId || !isAwaitingEarning()) return;
    const timer = setTimeout(refetchOrder, EARNING_REFETCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [placedOrderId]);
  return {
    number: order?.number ?? null,
    loyalty: order ? mapLoyalty(order) : null,
    loading,
  };
}
