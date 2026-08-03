'use client';

import { usePreloadedQuery } from 'react-relay';
import type { PreloadedQuery } from 'react-relay';
import { Checkout } from '@src/modules/checkout';
import { loadCheckoutQuery } from '@src/modules/checkout/api/queries/loadCheckoutQuery.shopana';
import type { loadCheckoutQuery as LoadCheckoutQueryType } from '@src/modules/checkout/api/queries/__generated__/loadCheckoutQuery.graphql';

interface CheckoutDataLoaderProps {
  queryReference: PreloadedQuery<LoadCheckoutQueryType>;
  onConfirm: () => void;
  brand?: React.ReactNode;
  features?: {
    auth?: boolean;
    country?: 'UA' | 'INTL';
  };
}

/** Loads the checkout query before mounting the regular checkout context. */
export function CheckoutDataLoader({
  queryReference,
  onConfirm,
  brand,
  features,
}: CheckoutDataLoaderProps) {
  const data = usePreloadedQuery<LoadCheckoutQueryType>(
    loadCheckoutQuery,
    queryReference
  );

  return (
    <Checkout
      cartId={data.checkout ? queryReference.variables.checkoutId : null}
      onConfirm={onConfirm}
      brand={brand}
      features={features}
    />
  );
}
