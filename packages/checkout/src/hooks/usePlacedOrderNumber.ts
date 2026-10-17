import { useQuery } from '@apollo/client/react';
import { placedOrderQuery } from '#checkout/api/queries/placedOrderQuery.shopana';

/** Human-readable number of a placed order; `null` until loaded or when the order is unreadable. */
export function usePlacedOrderNumber(orderId: string | null): {
  number: number | null;
  loading: boolean;
} {
  const { data, loading } = useQuery(placedOrderQuery, {
    variables: { orderId: orderId ?? '' },
    skip: !orderId,
    fetchPolicy: 'network-only',
  });
  return { number: data?.order?.number ?? null, loading };
}
