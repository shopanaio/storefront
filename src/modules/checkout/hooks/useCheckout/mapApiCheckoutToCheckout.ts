import type { Checkout } from '@src/modules/checkout/types/entity';
import type { model } from '@shopana/storefront-sdk';
import {
  type ApiCheckout,
  type ApiMoney,
  type ApiCheckoutCost,
  type ApiCheckoutLine,
  type ApiCheckoutLineCost,
  type ApiCheckoutPromoCode,
  type ApiCheckoutCustomerIdentity,
  type ApiCheckoutDeliveryGroup,
  type ApiCheckoutDeliveryAddress,
  type ApiCheckoutDeliveryMethod,
  type ApiDeliveryCost,
  type ApiCheckoutRecipient,
  type ApiCheckoutPayment,
  type ApiCheckoutPaymentMethod,
  type ApiCheckoutNotification,
  CurrencyCode,
} from '@codegen/schema-client';

/**
 * Maps API checkout data to domain Checkout entity
 */
export function mapApiCheckoutToCheckout(
  apiCheckout: Readonly<ApiCheckout>
): Checkout.Checkout {
  return {
    id: apiCheckout.id,
    createdAt: new Date(apiCheckout.createdAt),
    updatedAt: new Date(apiCheckout.updatedAt),
    totalQuantity: apiCheckout.totalQuantity,
    cost: mapApiCost(apiCheckout.cost),
    lines: apiCheckout.lines.map(mapApiLine),
    appliedPromoCodes: apiCheckout.appliedPromoCodes.map(mapApiPromoCode),
    customerIdentity: mapApiCustomerIdentity(apiCheckout.customerIdentity),
    customerNote: apiCheckout.customerNote,
    deliveryGroups: apiCheckout.deliveryGroups.map((group) =>
      mapApiDeliveryGroup(group, apiCheckout.lines)
    ),
    payment: mapApiPayment(apiCheckout.payment),
    notifications: apiCheckout.notifications.map(mapApiNotification),
  };
}

/**
 * Maps API Money to domain Money
 */
function mapApiMoney(
  apiMoney: Readonly<ApiMoney> | null | undefined
): model.Money {
  if (!apiMoney) {
    return { amount: 0, currencyCode: CurrencyCode.Uah };
  }
  return {
    amount: apiMoney.amount,
    currencyCode: apiMoney.currencyCode as model.Money['currencyCode'],
  };
}

/**
 * Maps API Cost to domain Cost
 */
function mapApiCost(apiCost: Readonly<ApiCheckoutCost>): Checkout.Cost {
  return {
    subtotalAmount: mapApiMoney(apiCost.subtotalAmount),
    totalAmount: mapApiMoney(apiCost.totalAmount),
    totalDiscountAmount: mapApiMoney(apiCost.totalDiscountAmount),
    totalShippingAmount: mapApiMoney(apiCost.totalShippingAmount),
    totalTaxAmount: mapApiMoney(apiCost.totalTaxAmount),
  };
}

/**
 * Maps API Line to domain Line
 */
function mapApiLine(apiLine: Readonly<ApiCheckoutLine>): Checkout.Line {
  const purchasable = apiLine.purchasable;
  const imageSrc = apiLine.imageSrc ?? null;
  const title = apiLine.title;
  const sku = apiLine.sku ?? null;

  return {
    id: apiLine.id,
    quantity: apiLine.quantity,
    cost: mapApiLineCost(apiLine.cost),
    imageSrc,
    purchasable: purchasable as unknown as Checkout.Purchasable,
    purchasableId: apiLine.purchasableId,
    purchasableSnapshot: apiLine.purchasableSnapshot,
    sku,
    title,
    children: apiLine.children.map((child) =>
      child ? mapApiLineChild(child) : null
    ),
  };
}

/**
 * Maps API Line child to domain Line (simplified for children)
 */
function mapApiLineChild(apiChild: Readonly<ApiCheckoutLine>): Checkout.Line {
  // Children typically have minimal data
  return {
    id: apiChild.id,
    quantity: apiChild.quantity,
    cost: {
      compareAtUnitPrice: { amount: 0, currencyCode: CurrencyCode.Uah },
      subtotalAmount: { amount: 0, currencyCode: CurrencyCode.Uah },
      totalAmount: { amount: 0, currencyCode: CurrencyCode.Uah },
      unitPrice: { amount: 0, currencyCode: CurrencyCode.Uah },
    },
    purchasableId: '',
    title: '',
    purchasable: null as any, // Children don't have full purchasable data
  };
}

/**
 * Maps API Line Cost to domain LineCost
 */
function mapApiLineCost(
  apiCost: Readonly<ApiCheckoutLineCost>
): Checkout.LineCost {
  return {
    unitPrice: mapApiMoney(apiCost.unitPrice),
    compareAtUnitPrice: mapApiMoney(apiCost.compareAtUnitPrice),
    subtotalAmount: mapApiMoney(apiCost.subtotalAmount),
    totalAmount: mapApiMoney(apiCost.totalAmount),
    discountAmount: mapApiMoney(apiCost.discountAmount),
    taxAmount: mapApiMoney(apiCost.taxAmount),
  };
}

/**
 * Maps API PromoCode to domain PromoCode
 */
function mapApiPromoCode(
  apiPromoCode: ApiCheckoutPromoCode
): Checkout.PromoCode {
  return {
    code: apiPromoCode.code,
    appliedAt: new Date(apiPromoCode.appliedAt),
    discountType: apiPromoCode.discountType,
    value: apiPromoCode.value,
    provider: apiPromoCode.provider,
  };
}

/**
 * Maps API CustomerIdentity to domain CustomerIdentity
 */
function mapApiCustomerIdentity(
  apiIdentity: ApiCheckoutCustomerIdentity
): Checkout.CustomerIdentity {
  return {
    email: apiIdentity.email,
    firstName: apiIdentity.firstName,
    lastName: apiIdentity.lastName,
    middleName: apiIdentity.middleName,
    phone: apiIdentity.phone,
  };
}

/**
 * Maps API DeliveryGroup to domain DeliveryGroup
 */
function mapApiDeliveryGroup(
  apiGroup: ApiCheckoutDeliveryGroup,
  allLines: ApiCheckoutLine[]
): Checkout.DeliveryGroup {
  // Map checkoutLines from IDs to full Line objects
  const checkoutLines = apiGroup.checkoutLines
    .map((lineRef) => {
      const fullLine = allLines.find((line) => line.id === lineRef.id);
      return fullLine ? mapApiLine(fullLine) : null;
    })
    .filter((line): line is Checkout.Line => line !== null);

  return {
    id: apiGroup.id,
    checkoutLines,
    deliveryAddress: apiGroup.deliveryAddress
      ? mapApiDeliveryAddress(apiGroup.deliveryAddress)
      : null,
    deliveryMethods: apiGroup.deliveryMethods.map(mapApiDeliveryMethod),
    estimatedCost: apiGroup.estimatedCost
      ? mapApiDeliveryCost(apiGroup.estimatedCost)
      : null,
    recipient: apiGroup.recipient ? mapApiRecipient(apiGroup.recipient) : null,
    selectedDeliveryMethod: apiGroup.selectedDeliveryMethod
      ? mapApiDeliveryMethod(apiGroup.selectedDeliveryMethod)
      : null,
  };
}

/**
 * Maps API DeliveryAddress to domain DeliveryAddress
 */
function mapApiDeliveryAddress(
  apiAddress: ApiCheckoutDeliveryAddress
): Checkout.DeliveryAddress {
  return {
    id: apiAddress.id,
    address1: apiAddress.address1,
    address2: apiAddress.address2,
    city: apiAddress.city,
    countryCode: apiAddress.countryCode,
    data: apiAddress.data,
    postalCode: apiAddress.postalCode,
    provinceCode: apiAddress.provinceCode,
  };
}

/**
 * Maps API DeliveryMethod to domain DeliveryMethod
 */
function mapApiDeliveryMethod(
  apiMethod: ApiCheckoutDeliveryMethod
): Checkout.DeliveryMethod {
  return {
    code: apiMethod.code,
    deliveryMethodType:
      apiMethod.deliveryMethodType as Checkout.DeliveryMethodType,
    provider: {
      code: apiMethod.provider.code,
    },
    data: apiMethod.data,
  };
}

/**
 * Maps API DeliveryCost to domain DeliveryCost
 */
function mapApiDeliveryCost(apiCost: ApiDeliveryCost): Checkout.DeliveryCost {
  return {
    amount: mapApiMoney(apiCost.amount),
    paymentModel: apiCost.paymentModel as Checkout.ShippingPaymentModel,
  };
}

/**
 * Maps API Recipient to domain Recipient
 */
function mapApiRecipient(
  apiRecipient: ApiCheckoutRecipient
): Checkout.Recipient {
  return {
    email: apiRecipient.email,
    firstName: apiRecipient.firstName,
    lastName: apiRecipient.lastName,
    middleName: apiRecipient.middleName,
    phone: apiRecipient.phone,
  };
}

/**
 * Maps API Payment to domain Payment
 */
function mapApiPayment(apiPayment: ApiCheckoutPayment): Checkout.Payment {
  return {
    payableAmount: mapApiMoney(apiPayment.payableAmount),
    paymentMethods: apiPayment.paymentMethods.map(mapApiPaymentMethod),
    selectedPaymentMethod: apiPayment.selectedPaymentMethod
      ? mapApiPaymentMethod(apiPayment.selectedPaymentMethod)
      : null,
  };
}

/**
 * Maps API PaymentMethod to domain PaymentMethod
 */
function mapApiPaymentMethod(
  apiMethod: ApiCheckoutPaymentMethod
): Checkout.PaymentMethod {
  return {
    code: apiMethod.code,
    provider: apiMethod.provider,
    flow: apiMethod.flow as Checkout.PaymentFlow,
    data: apiMethod.data,
  };
}

/**
 * Maps API Notification to domain Notification
 */
function mapApiNotification(
  apiNotification: ApiCheckoutNotification
): Checkout.Notification {
  return {
    id: apiNotification.id,
    code: apiNotification.code as Checkout.NotificationCode,
    severity: apiNotification.severity as Checkout.NotificationSeverity,
    isDismissed: apiNotification.isDismissed,
  };
}
