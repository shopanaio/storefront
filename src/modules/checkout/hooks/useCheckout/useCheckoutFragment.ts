import { graphql } from "react-relay";

export const useCheckoutFragment = graphql`
  fragment useCheckoutFragment on Checkout {
    id
    createdAt
    updatedAt
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalDiscountAmount {
        amount
        currencyCode
      }
      totalShippingAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    lines {
      id
      quantity
      cost {
        unitPrice {
          amount
          currencyCode
        }
        compareAtUnitPrice {
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
        discountAmount {
          amount
          currencyCode
        }
        taxAmount {
          amount
          currencyCode
        }
      }
      imageSrc
      purchasable {
        ... on ProductVariant {
          id
          sku
          title
          product {
            title
            handle
          }
        }
      }
      purchasableId
      purchasableSnapshot
      sku
      title
      children {
        id
        quantity
      }
    }
    appliedPromoCodes {
      code
      appliedAt
      discountType
      value
      provider
    }
    customerIdentity {
      countryCode
      customer {
        id
        email
        name {
          first
          middle
          last
        }
      }
      email
      firstName
      lastName
      middleName
      phone
    }
    customerNote
    deliveryGroups {
      id
      checkoutLines {
        id
      }
      deliveryAddress {
        id
        address1
        address2
        city
        countryCode
        data
        postalCode
        provinceCode
      }
      deliveryMethods {
        code
        deliveryMethodType
        provider {
          code
        }
        data
      }
      estimatedCost {
        amount {
          amount
          currencyCode
        }
        paymentModel
      }
      recipient {
        email
        firstName
        lastName
        middleName
        phone
      }
      selectedDeliveryMethod {
        code
        deliveryMethodType
        provider {
          code
        }
        data
      }
    }
    payment {
      payableAmount {
        amount
        currencyCode
      }
      paymentMethods {
        code
        provider {
          code
        }
        flow
        data
      }
      selectedPaymentMethod {
        code
        provider {
          code
        }
        flow
        data
      }
    }
    notifications {
      id
      code
      severity
      isDismissed
    }
  }
`;
