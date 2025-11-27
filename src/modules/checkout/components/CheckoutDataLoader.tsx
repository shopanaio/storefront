'use client';

import { usePreloadedQuery } from 'react-relay';
import type { PreloadedQuery } from 'react-relay';
import { Checkout } from '@src/modules/checkout';
import { loadCheckoutQuery } from '@src/modules/checkout/queries';
import type { loadCheckoutQuery as LoadCheckoutQueryType } from '@src/modules/checkout/queries/__generated__/loadCheckoutQuery.graphql';
import { useMemo } from 'react';
import { readInlineData } from 'react-relay';
import { CartLineFragment_line } from '@shopana/storefront-sdk/modules/cart/react/hooks/useCartLineFragment';

interface CheckoutDataLoaderProps {
  queryReference: PreloadedQuery<LoadCheckoutQueryType>;
  onConfirm: () => void;
  brand?: React.ReactNode;
  features?: {
    auth?: boolean;
    country?: 'UA' | 'INTL';
  };
}

/**
 * Component that loads checkout data using a preloaded query reference
 * and passes it to the Checkout component.
 */
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

  // For Shopana: checkoutQuery.checkout
  // For Shopify: cart
  const checkoutData = (data as any).checkoutQuery?.checkout || (data as any).cart;

  const checkout = useMemo(() => {
    if (!checkoutData) return null;

    return {
      ...checkoutData,
      lines: (checkoutData?.lines || [])?.map((cartLineRef: any) =>
        readInlineData(CartLineFragment_line, cartLineRef)
      ),
    };
  }, [checkoutData]);

  return (
    <Checkout
      checkout={checkout}
      onConfirm={onConfirm}
      brand={brand}
      features={features}
    />
  );
}
