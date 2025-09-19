import { readInlineData } from "react-relay";
import { graphql } from "react-relay";
import { useCartLineFragment_CartLineFragment$key } from "./__generated__/useCartLineFragment_CartLineFragment.graphql";

export const useCartLineFragment_CartLineFragment = graphql`
  fragment useCartLineFragment_CartLineFragment on CartLine @inline {
    iid
    id
    quantity
    cost {
      unitPrice {
        currencyCode
        amount
      }
      subtotalAmount {
        currencyCode
        amount
      }
      totalAmount {
        currencyCode
        amount
      }
    }
    purchasable {
      ... on Product {
        id
        title
        handle
        cover {
          id
          iid
          url
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
      }
    }
    appliedTaxLines {
      id
      iid
      title
      rate
      amountCollected {
        currencyCode
        amount
      }
    }
    appliedDiscounts {
      id
      code
      amount {
        currencyCode
        amount
      }
    }
    children {
      id
      iid
      quantity
    }
  }
`;

const useCartLineFragment = (cartLineKey: useCartLineFragment_CartLineFragment$key) => {
  // Use readInlineData instead of useFragment for inline fragments
  const shopanaCartLine = readInlineData(useCartLineFragment_CartLineFragment, cartLineKey);

  if (!shopanaCartLine) return null;

  return {
    cartLine: {
      iid: shopanaCartLine.iid,
      id: shopanaCartLine.id,
      quantity: shopanaCartLine.quantity,
      cost: {
        unitPrice: shopanaCartLine.cost.unitPrice,
        compareAtUnitPrice: null, // In Shopana no compareAtUnitPrice
        subtotalAmount: shopanaCartLine.cost.subtotalAmount,
        totalAmount: shopanaCartLine.cost.totalAmount,
      },
      purchasable: shopanaCartLine.purchasable,
      appliedTaxLines: shopanaCartLine.appliedTaxLines,
      appliedDiscounts: shopanaCartLine.appliedDiscounts,
      children: shopanaCartLine.children,
    }
  }
};

export default useCartLineFragment;
