'use client';

import * as React from 'react';
import { useFragment, useQuery } from '@apollo/client/react';
import {
  SdkStorefrontPromotionsDocument,
  SdkVolatileCardFieldsFragmentDoc,
  SdkVolatileVariantFieldsFragmentDoc,
  type SdkVolatileCardFieldsFragment,
  type SdkVolatileVariantFieldsFragment,
} from '../../../graphql/apollo/generated/operations';
import type { model } from '../../../model/namespace';
import { mapStorefrontPromotion } from '../../promotions/core/mapStorefrontPromotion';
import { ALL_PROMOTIONS_VARIABLES } from '../core/VolatileBatcher';
import { useVolatileBatcher } from './VolatileDataProvider';

const EMPTY: readonly model.StorefrontPromotion[] = [];

/** Fresh values of a variant, or what the page was rendered with until they come. */
export interface VolatileCard {
  /** The light answer came: the values are fresh. */
  ready: boolean;
  availableForSale?: boolean;
  price?: SdkVolatileCardFieldsFragment['price'];
  compareAtPrice?: SdkVolatileCardFieldsFragment['compareAtPrice'];
}

/**
 * The fast data of the variant a card of a listing shows: its id goes into the next batch of
 * the page, the values come from the cache record it is written into. The card renders the
 * static values first; the DOM changes only where the answer differs.
 */
export function useVolatileCard(
  variantId: string | null | undefined,
  productId?: string
): VolatileCard {
  const batcher = useVolatileBatcher();
  React.useEffect(() => {
    if (!batcher || !variantId) return undefined;
    return batcher.registerCard(variantId, productId);
  }, [batcher, variantId, productId]);
  const fragment = useFragment({
    fragment: SdkVolatileCardFieldsFragmentDoc,
    from: variantId ? { __typename: 'ProductVariant', id: variantId } : null,
    variables: { withPrice: batcher?.withPrice ?? false },
  });
  const data = fragment.data as
    | Partial<SdkVolatileCardFieldsFragment>
    | undefined;
  return {
    ready: Boolean(variantId) && fragment.complete,
    availableForSale: data?.availableForSale,
    price: data?.price,
    compareAtPrice: data?.compareAtPrice,
  };
}

export interface VolatileVariant {
  /**
   * The light answer came: false on the server, at hydration and until the answer, so the
   * markup matches the static HTML (a skeleton of the promotions, no limit of the quantity).
   */
  ready: boolean;
  /** How many can be ordered (`DENY` policy); null without a limit. */
  quantityAvailable: number | null;
  availableForSale?: boolean;
  currentlyNotInStock?: boolean;
  price?: SdkVolatileVariantFieldsFragment['price'];
  compareAtPrice?: SdkVolatileVariantFieldsFragment['compareAtPrice'];
  /** The promotions of the variant, with the texts the store's promotions have. */
  promotions: readonly model.StorefrontPromotion[];
  /** When the promotions change by themselves. */
  validUntil: Date | null;
}

/**
 * The fast data of the variant a product page (or a column of a comparison) shows whole, and
 * the availability of its siblings for the swatches of the options. Asks nothing itself: the
 * provider batches the ids.
 */
export function useVolatileVariant(
  variantId: string | null | undefined,
  siblings: readonly string[] = [],
  productId?: string
): VolatileVariant {
  const batcher = useVolatileBatcher();
  const siblingsKey = [...siblings].sort().join(',');
  React.useEffect(() => {
    if (!batcher || !variantId) return undefined;
    return batcher.registerVariant(
      variantId,
      siblingsKey ? siblingsKey.split(',') : [],
      productId
    );
  }, [batcher, variantId, siblingsKey, productId]);
  const fragment = useFragment({
    fragment: SdkVolatileVariantFieldsFragmentDoc,
    from: variantId ? { __typename: 'ProductVariant', id: variantId } : null,
    variables: { withPrice: batcher?.withPrice ?? false },
  });
  const ready = Boolean(variantId) && fragment.complete;
  const data = fragment.data as
    | Partial<SdkVolatileVariantFieldsFragment>
    | undefined;
  const store = useQuery(SdkStorefrontPromotionsDocument, {
    variables: ALL_PROMOTIONS_VARIABLES,
    fetchPolicy: 'cache-only',
    skip: !ready,
  });
  const texts = store.data?.storefrontPromotions?.promotions;
  const keys = ready
    ? (data?.promotions?.promotions ?? []).map((promotion) => promotion.key)
    : [];
  const keysKey = keys.join(',');
  const promotions = React.useMemo(() => {
    if (!keysKey || !texts) return EMPTY;
    const byKey = new Map(texts.map((promotion) => [promotion.key, promotion]));
    return keysKey
      .split(',')
      .map((key) => byKey.get(key))
      .filter((promotion) => promotion !== undefined)
      .map(mapStorefrontPromotion);
  }, [keysKey, texts]);
  const validUntil = ready ? data?.promotions?.validUntil : null;
  return {
    ready,
    quantityAvailable: ready ? (data?.quantityAvailable ?? null) : null,
    availableForSale: data?.availableForSale,
    currentlyNotInStock: data?.currentlyNotInStock,
    price: data?.price,
    compareAtPrice: data?.compareAtPrice,
    promotions,
    validUntil: validUntil ? new Date(validUntil) : null,
  };
}

/** Asks again for the fast data of variants now (a cart answered that one is out of stock). */
export function useRefreshVolatile(): (ids?: readonly string[]) => void {
  const batcher = useVolatileBatcher();
  return React.useCallback((ids) => batcher?.refresh(ids), [batcher]);
}
