import { graphql, readInlineData, useFragment } from 'react-relay';
import { useCartContext } from '@src/providers/cart-context';
import { useCheckout_CheckoutFragment$key } from './__generated__/useCheckout_CheckoutFragment.graphql';
import cartIdUtils from '@src/utils/cartId';
import React, { useEffect, useMemo } from 'react';
import { useCartLineFragment_CartLineFragment } from '@src/hooks/cart/useCartLineFragment/useCartLineFragment.shopana';

export const useCheckout_CheckoutFragment = graphql`
  fragment useCheckout_CheckoutFragment on Checkout {
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
    appliedPromoCodes {
      code
      appliedAt
      discountType
      value
      provider
    }
    customerNote
    notifications {
      code
      severity
      isDismissed
    }
    customerIdentity {
      lastName
      firstName
      middleName
      email
      phone
    }
    deliveryGroups {
      id
      checkoutLines {
        id
      }
      deliveryAddress {
        id
        data
        address1
        address2
        city
        countryCode
        provinceCode
        postalCode
      }
      recipient {
        firstName
        middleName
        lastName
        email
        phone
      }
      deliveryMethods {
        code
        deliveryMethodType
        provider {
          code
          data
        }
      }
      selectedDeliveryMethod {
        code
        deliveryMethodType
        provider {
          code
          data
        }
      }
      estimatedCost {
        amount {
          amount
          currencyCode
        }
        paymentModel
      }
    }
    payment {
      paymentMethods {
        code
        provider
        flow
        metadata
      }
      selectedPaymentMethod {
        code
        provider
      }
      payableAmount {
        amount
        currencyCode
      }
    }
    totalQuantity
    lines {
      ...useCartLineFragment_CartLineFragment
    }
  }
`;

const useCheckout = () => {
  const { cartKey, isCartLoading, isCartLoaded } = useCartContext();

  const checkoutFragment = useFragment<useCheckout_CheckoutFragment$key>(
    useCheckout_CheckoutFragment,
    cartKey
  );

  const checkout = useMemo(() => {
    if (!checkoutFragment) return null;
    return checkoutFragment;
  }, [checkoutFragment]);

  const checkoutId = checkout?.id || null;

  useEffect(() => {
    if (!checkoutId) {
      return;
    }
    cartIdUtils.setCartIdCookie(checkoutId);
  }, [checkoutId]);

  // Log checkout information
  React.useEffect(() => {
    console.log('Shopana checkout active');
  }, []);

  const checkoutMemo = useMemo(() => {
    if (!checkout) {
      return null;
    }
    return {
      ...checkout,
      lines: (checkout?.lines || [])?.map((cartLineRef) =>
        readInlineData(useCartLineFragment_CartLineFragment, cartLineRef)
      ),
    };
  }, [checkout]);

  return {
    checkout: checkoutMemo,
    loading: isCartLoading,
    loaded: isCartLoaded,
    error: null,
  };
};

export default useCheckout;
