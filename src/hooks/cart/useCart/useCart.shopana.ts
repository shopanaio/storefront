import { graphql, readInlineData, useFragment } from "react-relay";
import { useCartContext } from "@src/providers/cart-context";
import { useCart_CartFragment$key } from "./__generated__/useCart_CartFragment.graphql";
import cartIdUtils from "@src/utils/cartId";
import React, { useEffect, useMemo } from "react";
import { useCartLineFragment_CartLineFragment } from "@src/hooks/cart/useCartLineFragment/useCartLineFragment.shopana";

export const useCart_CartFragment = graphql`
  fragment useCart_CartFragment on Checkout {
    id
    createdAt
    updatedAt
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
    totalQuantity
    lines {
      ...useCartLineFragment_CartLineFragment
    }
  }
`;

const useCart = () => {
  const { cartKey, isCartLoading, isCartLoaded } = useCartContext();

  const cartFragment = useFragment<useCart_CartFragment$key>(
    useCart_CartFragment,
    cartKey
  );

  const cart = useMemo(() => {
    if (!cartFragment) return null;
    return cartFragment;
  }, [cartFragment]);

  const cartId = cart?.id || null;

  useEffect(() => {
    if (!cartId) {
      return;
    }
    cartIdUtils.setCartIdCookie(cartId);
  }, [cartId]);

  // Log cart information, but don't clear
  React.useEffect(() => {
    console.log("Shopana cart active");
  }, []);

  const cartMemo = useMemo(() => {
    if (!cart) {
      return null;
    }
    return {
      ...cart,
      lines: (cart?.lines || [])?.map((cartLineRef) =>
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
