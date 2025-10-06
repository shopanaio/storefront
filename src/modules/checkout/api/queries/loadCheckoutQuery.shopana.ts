import { graphql } from "react-relay";

/**
 * Query to load a checkout by ID for Shopana platform.
 * All fields are inlined except for purchasable fragment.
 */
export const loadCheckoutQuery = graphql`
  query loadCheckoutQuery($checkoutId: ID!) {
    checkoutQuery {
      checkout(id: $checkoutId) {
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
        lines {
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
      }
    }
  }
`;
