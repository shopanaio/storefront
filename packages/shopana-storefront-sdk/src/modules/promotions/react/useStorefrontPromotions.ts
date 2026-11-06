'use client';

import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import type { model } from '../../../model/namespace';
import {
  SdkStorefrontPromotionsDocument,
  type StorefrontPromotionKind,
} from '../../../graphql/apollo/generated/operations';
import { mapStorefrontPromotion } from '../core/mapStorefrontPromotion';
import { useValidUntilRefetch } from '../../../static/useValidUntilRefetch';

export interface StorefrontPromotionsState {
  /** Ordered by the merchant sort order, then by discount priority. */
  promotions: readonly model.StorefrontPromotion[];
  /** Nearest start or end of a published promotion; the set may change after it. */
  validUntil: Date | null;
  loading: boolean;
  error: Error | null;
}

const EMPTY: readonly model.StorefrontPromotion[] = [];

/**
 * Published automatic promotions of the store, the same for every buyer. `kinds` limits the
 * result; omitted returns every kind. Promo codes are never part of it.
 */
export interface StorefrontPromotionsOptions {
  /** Asks nothing yet: a caller that shows the set only in the browser (after hydration). */
  skip?: boolean;
}

export function useStorefrontPromotions(
  kinds?: readonly StorefrontPromotionKind[],
  { skip = false }: StorefrontPromotionsOptions = {}
): StorefrontPromotionsState {
  const kindsKey = kinds ? [...kinds].sort().join(',') : null;
  const variables = React.useMemo(
    () => ({
      kinds:
        kindsKey === null
          ? null
          : (kindsKey.split(',').filter(Boolean) as StorefrontPromotionKind[]),
    }),
    [kindsKey]
  );
  const query = useQuery(SdkStorefrontPromotionsDocument, {
    variables,
    fetchPolicy: 'cache-first',
    skip,
  });
  const set = query.data?.storefrontPromotions;
  // The set changes at its next start or end without an event: asked again then (a page
  // rendered earlier, a static one, carries the set of its render).
  const { refetch } = query;
  useValidUntilRefetch(
    set?.validUntil,
    React.useCallback(() => refetch(), [refetch])
  );
  const promotions = React.useMemo(
    () => set?.promotions.map(mapStorefrontPromotion) ?? EMPTY,
    [set]
  );
  return {
    promotions,
    validUntil: set?.validUntil ? new Date(set.validUntil) : null,
    loading: query.loading && !set,
    error: query.error ?? null,
  };
}
