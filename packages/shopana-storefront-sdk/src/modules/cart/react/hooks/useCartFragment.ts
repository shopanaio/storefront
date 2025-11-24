import { graphql, readInlineData, useFragment } from 'react-relay';
// @ts-ignore - TODO: Phase 2 - Move useCartContext to SDK
import { useCartContext } from '@src/providers/cart-context';
// @ts-ignore - TODO: Phase 2 - Generated types will be available after relay-compiler runs
import { useCart_CartFragment$key } from './__generated__/useCart_CartFragment.graphql';
import { useMemo } from 'react';
import { useCartLineFragment_CartLineFragment } from './useCartLineFragment';

export const useCart_CartFragment = graphql`
  fragment useCart_CartFragment on Checkout {
    id
    createdAt
    updatedAt
    totalQuantity
    cost {
      subtotalAmount {
        currencyCode
        amount
      }
      totalDiscountAmount {
        currencyCode
        amount
      }
      totalTaxAmount {
        currencyCode
        amount
      }
      totalAmount {
        currencyCode
        amount
      }
      totalShippingAmount {
        currencyCode
        amount
      }
    }
    customerNote
    notifications {
      code
      severity
      isDismissed
    }
    lines {
      ...useCartLineFragment_CartLineFragment
    }
  }
`;

const useCart = () => {
  const { cartKey, isCartLoading, isCartLoaded } = useCartContext();

  const cart = useFragment<useCart_CartFragment$key>(
    useCart_CartFragment,
    cartKey
  );

  const cartMemo = useMemo(() => {
    if (!cart) {
      return null;
    }
    return {
      ...cart,
      lines: (cart?.lines || [])?.map((cartLineRef: any) =>
        readInlineData(useCartLineFragment_CartLineFragment, cartLineRef)
      ),
    };
  }, [cart]);

  return {
    cart: cartMemo,
    loading: isCartLoading,
    loaded: isCartLoaded,
    error: null,
  };
};

export default useCart;
