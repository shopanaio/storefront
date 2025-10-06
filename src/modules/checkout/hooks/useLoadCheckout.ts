import { useQueryLoader } from 'react-relay';
import { useEffect } from 'react';
import { loadCheckoutQuery } from '@checkout/api/queries/loadCheckoutQuery.shopana';
import type { loadCheckoutQuery as LoadCheckoutQueryType } from '@checkout/api/queries/__generated__/loadCheckoutQuery.graphql';
import { cmsPick } from '@src/cms/pick';

// Variables differ between platforms: Shopana uses checkoutId, Shopify uses id
type CheckoutQueryVariables = { checkoutId: string } | { id: string };

const getVariables = cmsPick({
  shopana: (checkoutId: string): CheckoutQueryVariables =>
    ({ checkoutId }) as any,
  shopify: (checkoutId: string): CheckoutQueryVariables =>
    ({ id: checkoutId }) as any,
});

/**
 * Hook to preload checkout data using Relay's useQueryLoader.
 * This hook prepares a query reference that can be used with usePreloadedQuery.
 *
 * @param checkoutId - The ID of the checkout to load
 * @returns Object containing the query reference and loadQuery function
 */
export function useLoadCheckout({ checkoutId }: { checkoutId: string | null }) {
  const [queryReference, loadQuery, disposeQuery] =
    useQueryLoader<LoadCheckoutQueryType>(loadCheckoutQuery);

  useEffect(() => {
    if (checkoutId) {
      const variables = getVariables(checkoutId);
      loadQuery(variables as any);
    }

    return () => {
      disposeQuery();
    };
  }, [checkoutId, loadQuery, disposeQuery]);

  return {
    queryReference,
    loadQuery,
    disposeQuery,
  };
}
