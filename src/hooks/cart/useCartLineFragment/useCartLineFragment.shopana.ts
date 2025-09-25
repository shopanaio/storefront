import { useFragment } from "react-relay";
import { graphql } from "react-relay";
import { useCartLineFragment_CartLineFragment$key } from "./__generated__/useCartLineFragment_CartLineFragment.graphql";

export const useCartLineFragment_CartLineFragment = graphql`
  fragment useCartLineFragment_CartLineFragment on CheckoutLine {
    id
    quantity
    cost {
      unitPrice {
        currencyCode
        amount
      }
      compareAtUnitPrice {
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
    purchasableId
    purchasable {
      ... on ProductVariant {
        id
        title
        handle
        cover {
          id
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
    children {
      id
      quantity
    }
  }
`;

const useCartLineFragment = (
  cartLineKey: useCartLineFragment_CartLineFragment$key
) => {
  // Use useFragment for standard fragments
  const shopanaCartLine = useFragment(
    useCartLineFragment_CartLineFragment,
    cartLineKey
  );

  if (!shopanaCartLine) return null;

  return {
    cartLine: {
      id: shopanaCartLine.id,
      quantity: shopanaCartLine.quantity,
      cost: {
        unitPrice: shopanaCartLine.cost.unitPrice,
        compareAtUnitPrice: shopanaCartLine.cost.compareAtUnitPrice,
        subtotalAmount: shopanaCartLine.cost.subtotalAmount,
        totalAmount: shopanaCartLine.cost.totalAmount,
      },
      purchasable: shopanaCartLine.purchasable,
      children: shopanaCartLine.children,
    },
  };
};

export default useCartLineFragment;
