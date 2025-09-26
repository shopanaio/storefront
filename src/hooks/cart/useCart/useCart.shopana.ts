import { graphql, useFragment } from "react-relay";
import { useCartContext } from "@src/providers/cart-context";
import { useCart_CartFragment$key } from "./__generated__/useCart_CartFragment.graphql";
import cartIdUtils from "@src/utils/cartId";
import React, { useEffect, useMemo } from "react";
import { Entity } from "@src/entity";

export const useCart_CartFragment = graphql`
  fragment useCart_CartFragment on Checkout {
    id
    # iid
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
    #shippingDetails{
    #    availableMethods{
    #      id
    #      iid
    #      handle
    #      title
    #      estimatedDeliveryTime
    #    }
    #    selectedMethod{
    #      id
    #      iid
    #      handle
    #      title
    #      estimatedDeliveryTime
    #    }
    #    estimatedDeliveryDate
    #  }
    #paymentDetails{
    #    availableMethods{
    #      id
    #      iid
    #      handle
    #      title
    #      estimatedDeliveryTime
    #    }
    #    selectedMethod{
    #      id
    #      iid
    #      handle
    #      title
    #      estimatedDeliveryTime
    #    }
    #  }
    totalQuantity
    lines {
      id
      quantity
      purchasableId
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
    return cartFragment as Entity.Cart;
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

  return {
    cart: {},
    loading: isCartLoading,
    loaded: isCartLoaded,
    error: null,
  };
};

export default useCart;
