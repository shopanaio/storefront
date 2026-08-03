import { graphql } from "react-relay";

export const useCheckoutFragment = graphql`
  fragment useCheckoutFragment on Checkout {
    id
    channelCode
    localeCode
    currencyCode
    version
    resultRevision
    valid
    issues {
      code
      message
      severity
      effect
      field
      lineId
      retryable
    }
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
      image {
        id
        image { url width height altText }
      }
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
      attributes
      purchase {
        type
      }
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
        displayName
        firstName
        lastName
        emailAddress {
          emailAddress
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
        postalCode: zip
        provinceCode
        name
        company
        phone
        country
        province
        formatted
        formattedArea
      }
      deliveryMethods: options {
        handle
        code
        title
        description
        deliveryMethodType
        providerCode: carrierCode
        data: publicData
        cost { amount currencyCode }
        estimatedMinDeliveryAt
        estimatedMaxDeliveryAt
        phoneRequired
      }
      recipient {
        email
        firstName
        lastName
        middleName
        phone
      }
      selectedDeliveryMethod: selection {
        status
        previousOptionHandle
        resetReason { code message }
        option {
          handle
          code
          title
          description
          deliveryMethodType
          providerCode: carrierCode
          data: publicData
          cost { amount currencyCode }
        }
      }
    }
    payment {
      payableAmount {
        amount
        currencyCode
      }
      paymentMethods: methods {
        handle
        code
        title
        providerCode
        flow
      }
      selectedPaymentMethod: selection {
        status
        previousMethodHandle
        resetReason { code message }
        method {
          handle
          code
          title
          providerCode
          flow
        }
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
