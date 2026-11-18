'use client';

import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import type { model } from '../../../model/namespace';
import { SdkPromotionBenefitProductsDocument } from '../../../graphql/apollo/generated/operations';
import { mapPromotionBenefitOffer } from '../core/mapStorefrontPromotion';

export interface PromotionBenefitOffersState {
  /** The first available variant of each product, with its price as the benefit. */
  offers: readonly model.PromotionBenefitOffer[];
  loading: boolean;
  error: Error | null;
}

const EMPTY: readonly model.PromotionBenefitOffer[] = [];

/**
 * The products a buy X get Y promotion lowers, from the listing of its BENEFIT role, each with
 * `benefitPrice`: what one unit costs as the benefit. Nothing is asked while `promotionKey` is
 * null.
 */
export function usePromotionBenefitOffers(
  promotionKey: string | null,
  { first = 10 }: { first?: number } = {}
): PromotionBenefitOffersState {
  const query = useQuery(SdkPromotionBenefitProductsDocument, {
    variables: { promotionKey: promotionKey ?? '', first },
    skip: !promotionKey,
    fetchPolicy: 'cache-first',
  });
  const nodes = query.data?.products.nodes;
  const offers = useMemo(
    () =>
      nodes?.flatMap((product) =>
        product.selectedOrFirstAvailableVariant
          ? [mapPromotionBenefitOffer(product.selectedOrFirstAvailableVariant)]
          : []
      ) ?? EMPTY,
    [nodes]
  );
  return {
    offers,
    loading: query.loading && !nodes,
    error: query.error ?? null,
  };
}
