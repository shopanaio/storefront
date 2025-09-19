import { readInlineData } from "react-relay";
import { graphql } from "react-relay";
import { useCartLineFragment_CartLineFragment$key } from "./__generated__/useCartLineFragment_CartLineFragment.graphql";

export const useCartLineFragment_CartLineFragment = graphql`
  fragment useCartLineFragment_CartLineFragment on CartLine @inline{
    id
    quantity
    cost {
      amountPerQuantity {
        amount
        currencyCode
      }
      compareAtAmountPerQuantity {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        title
        sku
        availableForSale
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        image {
          id
          url
          altText
          width
          height
        }
        product {
          id
          title
          handle
          description
        }
      }
    }
    discountAllocations {
      discountedAmount {
        amount
        currencyCode
      }
    }
    attributes {
      key
      value
    }
    sellingPlanAllocation {
      sellingPlan {
        id
        name
        description
      }
    }
  }
`;

const useCartLineFragment = (cartLineKey: useCartLineFragment_CartLineFragment$key) => {
  // Use readInlineData instead of useFragment for inline fragments
  const shopifyCartLine = readInlineData(useCartLineFragment_CartLineFragment, cartLineKey);

  if (!shopifyCartLine) return null

  return {
    cartLine: {
      iid: shopifyCartLine.id,
      id: shopifyCartLine.id,
      quantity: shopifyCartLine.quantity,
      cost: {
        unitPrice: {
          currencyCode: shopifyCartLine.cost.amountPerQuantity.currencyCode,
          amount: shopifyCartLine.cost.amountPerQuantity.amount,
        },
        compareAtUnitPrice: shopifyCartLine.cost.compareAtAmountPerQuantity ? {
          currencyCode: shopifyCartLine.cost.compareAtAmountPerQuantity.currencyCode,
          amount: shopifyCartLine.cost.compareAtAmountPerQuantity.amount,
        } : null,
        subtotalAmount: {
          currencyCode: shopifyCartLine.cost.subtotalAmount.currencyCode,
          amount: shopifyCartLine.cost.subtotalAmount.amount,
        },
        totalAmount: {
          currencyCode: shopifyCartLine.cost.totalAmount.currencyCode,
          amount: shopifyCartLine.cost.totalAmount.amount,
        },
      },
      purchasable: {
        id: shopifyCartLine.merchandise.id,
        title: shopifyCartLine.merchandise.product?.title || "",
        handle: shopifyCartLine.merchandise.product?.handle || "",
        cover: {
          id: shopifyCartLine.merchandise.image?.id || "",
          iid: shopifyCartLine.merchandise.image?.id || "",
          url: shopifyCartLine.merchandise.image?.url || "",
        },
        price: {
          amount: shopifyCartLine.merchandise.price?.amount || "0",
          currencyCode: shopifyCartLine.merchandise.price?.currencyCode || "USD",
        },
        compareAtPrice: {
          amount: shopifyCartLine.merchandise.compareAtPrice?.amount || "0",
          currencyCode:
            shopifyCartLine.merchandise.compareAtPrice?.currencyCode ||
            shopifyCartLine.merchandise.price?.currencyCode ||
            "USD",
        },
      },
      appliedTaxLines: [], // In Shopify no separate field for taxes
      appliedDiscounts: shopifyCartLine.discountAllocations.map(
        (discount) => ({
          id: discount.discountedAmount.amount,
          code: "",
          amount: {
            currencyCode: discount.discountedAmount.currencyCode,
            amount: discount.discountedAmount.amount,
          },
        })
      ),
      children: [], // In Shopify no children for CartLine
      // Additional Shopify fields
      attributes: shopifyCartLine.attributes,
      sellingPlanAllocation: shopifyCartLine.sellingPlanAllocation,
      availableForSale: shopifyCartLine.merchandise.availableForSale,
      sku: shopifyCartLine.merchandise.sku,
    }
  }
};

export default useCartLineFragment;
