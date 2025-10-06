import type { Money } from '@src/entity/Money';

/**
 * Checkout domain entity shaped like API Checkout.
 * Nested types use domain primitives (e.g., Money) where applicable.
 */
export interface Checkout {
  /** A globally-unique ID. */
  id: string;
  /** When this checkout was first created. */
  createdAt: Date;
  /** When this checkout was last updated. */
  updatedAt: Date;
  /** Quantity of the item being purchased. */
  totalQuantity: number;
  /** All cost calculations for the checkout. */
  cost: CheckoutCost;
  /** List of items in the checkout. */
  lines: CheckoutLine[];
  /** Applied promo codes for the checkout. */
  appliedPromoCodes: CheckoutPromoCode[];
  /** Customer identity associated with the checkout. */
  customerIdentity: CheckoutCustomerIdentity;
  /** Customer note or special instructions for the checkout. */
  customerNote?: string | null;
  /** Delivery groups. */
  deliveryGroups: CheckoutDeliveryGroup[];
  /** Payment aggregate for this checkout. */
  payment: CheckoutPayment;
  /** Notifications for the user regarding the checkout. */
  notifications: CheckoutNotification[];
}

export interface CheckoutLine {
  id: string;
  quantity: number;
  /** Children lines (for bundles). */
  children?: Array<CheckoutLine | null>;
  /** Cost calculations for this checkout item. */
  cost: CheckoutLineCost;
  /** Image URL of the purchasable (optional). */
  imageSrc?: string | null;
  /** Purchasable entity projection. */
  purchasable: {
    title: string;
  };
  /** ID of the purchasable. */
  purchasableId: string;
  /** Purchasable snapshot data at the time of adding to checkout. */
  purchasableSnapshot?: unknown;
  /** SKU of the purchasable. */
  sku?: string | null;
  /** Title of the purchasable. */
  title: string;
}

export type { Checkout as EntityCheckout };

/**
 * Cost breakdown for the entire checkout.
 */
export interface CheckoutCost {
  subtotalAmount: Money;
  totalAmount: Money;
  totalDiscountAmount: Money;
  totalShippingAmount: Money;
  totalTaxAmount: Money;
}

/**
 * Detailed breakdown of costs for a checkout line item
 */
export interface CheckoutLineCost {
  compareAtUnitPrice: Money;
  discountAmount?: Money;
  subtotalAmount: Money;
  taxAmount?: Money;
  totalAmount: Money;
  unitPrice: Money;
}

/** Applied promo code for a checkout. */
export interface CheckoutPromoCode {
  appliedAt: Date;
  code: string;
  conditions?: unknown;
  discountType: string;
  provider: string;
  value: number;
}

/** Customer identity associated with the checkout. */
export interface CheckoutCustomerIdentity {
  countryCode?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  phone?: string | null;
}

/** Delivery group for one or more checkout lines. */
export interface CheckoutDeliveryGroup {
  /** Unique identifier for the delivery group. */
  id: string;
  /** Checkout lines associated with the delivery group. */
  checkoutLines: CheckoutLine[];
  /** Delivery address associated with the delivery group. */
  deliveryAddress?: CheckoutDeliveryAddress | null;
  /** Delivery methods associated with the delivery group. */
  deliveryMethods: CheckoutDeliveryMethod[];
  /** Estimated cost of the delivery group. */
  estimatedCost?: DeliveryCost | null;
  /** Recipient associated with the delivery group. */
  recipient?: CheckoutRecipient | null;
  /** Selected delivery method associated with the delivery group. */
  selectedDeliveryMethod?: CheckoutDeliveryMethod | null;
}

/** Delivery address associated with a checkout. */
export interface CheckoutDeliveryAddress {
  address1: string;
  address2?: string | null;
  city: string;
  countryCode: string;
  data?: unknown;
  id: string;
  postalCode?: string | null;
  provinceCode?: string | null;
}

/** Delivery method available for a checkout. */
export interface CheckoutDeliveryMethod {
  code: string;
  deliveryMethodType: CheckoutDeliveryMethodType;
  provider: CheckoutDeliveryProvider;
}

export type CheckoutDeliveryMethodType = 'PICKUP' | 'SHIPPING';

/** Provider data associated with the delivery method. */
export interface CheckoutDeliveryProvider {
  code: string;
  data: unknown;
}

/** Delivery cost with payment model */
export interface DeliveryCost {
  amount: Money;
  paymentModel: ShippingPaymentModel;
}

export type ShippingPaymentModel =
  | 'MERCHANT_COLLECTED'
  | 'CARRIER_DIRECT'
  | string;

/** Payment aggregate for a checkout. */
export interface CheckoutPayment {
  payableAmount: Money;
  paymentMethods: CheckoutPaymentMethod[];
  selectedPaymentMethod?: CheckoutPaymentMethod | null;
}

/** Payment method available/selected for checkout. */
export interface CheckoutPaymentMethod {
  code: string;
  constraints?: CheckoutPaymentMethodConstraints | null;
  flow: PaymentFlow;
  metadata?: unknown;
  provider: string;
}

/** Constraints for payment method availability. */
export interface CheckoutPaymentMethodConstraints {
  shippingMethods: string[];
}

export type PaymentFlow = 'ONLINE' | 'ON_DELIVERY' | string;

/** A non-blocking warning generated by checkout operations. */
export interface CheckoutNotification {
  code: CheckoutNotificationCode;
  id: string;
  isDismissed: boolean;
  severity: NotificationSeverity;
}

export type CheckoutNotificationCode =
  | 'ITEM_UNAVAILABLE'
  | 'NOT_ENOUGH_STOCK'
  | 'OUT_OF_STOCK'
  | 'PRICE_CHANGED'
  | string;

export type NotificationSeverity = 'INFO' | 'WARNING' | string;

/** Recipient details for the delivery group. */
export interface CheckoutRecipient {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  phone?: string | null;
}
