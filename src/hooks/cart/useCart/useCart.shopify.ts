import { graphql, useFragment } from 'react-relay';
import { useCartContext } from '@src/providers/cart-context';
import { useCart_CartFragment$key } from './__generated__/useCart_CartFragment.graphql';
import cartIdUtils from '@src/utils/cartId';

export const useCart_CartFragment = graphql`
  fragment useCart_CartFragment on Cart {
    id
    createdAt
    updatedAt
    totalQuantity
    checkoutUrl
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      checkoutChargeAmount {
        amount
        currencyCode
      }
      subtotalAmountEstimated
      totalAmountEstimated
    }
    lines(first: 50) {
      edges {
        cursor
        node {
          ...useCartLineFragment_CartLineFragment
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

// Mapper function for converting Shopify Cart to API Cart
const mapShopifyCartToApiCart = (shopifyCart: any) => {
  if (!shopifyCart) return null;

  return {
    id: shopifyCart.id,
    iid: shopifyCart.id,
    createdAt: shopifyCart.createdAt,
    updatedAt: shopifyCart.updatedAt,
    cost: {
      subtotalAmount: {
        currencyCode: shopifyCart.cost.subtotalAmount.currencyCode,
        amount: shopifyCart.cost.subtotalAmount.amount,
      },
      shippingCost: {
        currencyCode:
          shopifyCart.cost.checkoutChargeAmount?.currencyCode ||
          shopifyCart.cost.totalAmount.currencyCode,
        amount: shopifyCart.cost.checkoutChargeAmount?.amount || '0',
      },
      totalDiscountAmount: {
        currencyCode: shopifyCart.cost.totalAmount.currencyCode,
        amount: '0',
      },
      totalTaxAmount: {
        currencyCode: shopifyCart.cost.totalAmount.currencyCode,
        amount: '0', // In Shopify no separate field for taxes
      },
      totalAmount: {
        currencyCode: shopifyCart.cost.totalAmount.currencyCode,
        amount: shopifyCart.cost.totalAmount.amount,
      },
    },
    totalQuantity: shopifyCart.totalQuantity,
    lines: {
      totalCount: shopifyCart.lines?.edges?.length || 0,
      edges: shopifyCart.lines?.edges || [], // Safe check
      pageInfo: shopifyCart.lines?.pageInfo || null,
    },
  };
};

const useCart = () => {
  const { cartKey, isCartLoading, isCartLoaded } = useCartContext();

  // Always call useFragment, but pass null if cartKey is missing
  const shopifyCart = useFragment<useCart_CartFragment$key>(
    useCart_CartFragment,
    cartKey || null
  );

  // Use if instead of ternary operator
  let cart = null;
  if (shopifyCart) {
    cart = mapShopifyCartToApiCart(shopifyCart);
  }

  if (cart) {
    cartIdUtils.setCartIdCookie(cart.id);
  }

  return {
    cart,
    loading: isCartLoading,
    loaded: isCartLoaded,
    error: null,
  };
};

export default useCart;
