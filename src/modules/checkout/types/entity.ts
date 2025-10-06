import type { Entity } from '@src/entity';

/**
 * Checkout domain types namespace
 */
export namespace Checkout {
  export type Purchasable = Entity.Product;

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
    cost: Cost;
    /** List of items in the checkout. */
    lines: Line[];
    /** Applied promo codes for the checkout. */
    appliedPromoCodes: PromoCode[];
    /** Customer identity associated with the checkout. */
    customerIdentity: CustomerIdentity;
    /** Customer note or special instructions for the checkout. */
    customerNote?: string | null;
    /** Delivery groups. */
    deliveryGroups: DeliveryGroup[];
    /** Payment aggregate for this checkout. */
    payment: Payment;
    /** Notifications for the user regarding the checkout. */
    notifications: Notification[];
  }

  export interface Line {
    id: string;
    quantity: number;
    /** Children lines (for bundles). */
    children?: Array<Line | null>;
    /** Cost calculations for this checkout item. */
    cost: LineCost;
    /** Image URL of the purchasable (optional). */
    imageSrc?: string | null;
    /** Purchasable entity - full product data. */
    purchasable: Purchasable;
    /** ID of the purchasable. */
    purchasableId: string;
    /** Purchasable snapshot data at the time of adding to checkout. */
    purchasableSnapshot?: unknown;
    /** SKU of the purchasable. */
    sku?: string | null;
    /** Title of the purchasable. */
    title: string;
  }

  /**
   * Cost breakdown for the entire checkout.
   */
  export interface Cost {
    subtotalAmount: Entity.Money;
    totalAmount: Entity.Money;
    totalDiscountAmount: Entity.Money;
    totalShippingAmount: Entity.Money;
    totalTaxAmount: Entity.Money;
  }

  /**
   * Detailed breakdown of costs for a checkout line item
   */
  export interface LineCost {
    compareAtUnitPrice: Entity.Money;
    discountAmount?: Entity.Money;
    subtotalAmount: Entity.Money;
    taxAmount?: Entity.Money;
    totalAmount: Entity.Money;
    unitPrice: Entity.Money;
  }

  /** Applied promo code for a checkout. */
  export interface PromoCode {
    appliedAt: Date;
    code: string;
    conditions?: unknown;
    discountType: string;
    provider: string;
    value: number;
  }

  /** Customer identity associated with the checkout. */
  export interface CustomerIdentity {
    countryCode?: string | null;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    middleName?: string | null;
    phone?: string | null;
  }

  /** Delivery group for one or more checkout lines. */
  export interface DeliveryGroup {
    /** Unique identifier for the delivery group. */
    id: string;
    /** Checkout lines associated with the delivery group. */
    checkoutLines: Line[];
    /** Delivery address associated with the delivery group. */
    deliveryAddress?: DeliveryAddress | null;
    /** Delivery methods associated with the delivery group. */
    deliveryMethods: DeliveryMethod[];
    /** Estimated cost of the delivery group. */
    estimatedCost?: DeliveryCost | null;
    /** Recipient associated with the delivery group. */
    recipient?: Recipient | null;
    /** Selected delivery method associated with the delivery group. */
    selectedDeliveryMethod?: DeliveryMethod | null;
  }

  /** Delivery address associated with a checkout. */
  export interface DeliveryAddress {
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
  export interface DeliveryMethod {
    code: string;
    deliveryMethodType: DeliveryMethodType;
    provider: DeliveryProvider;
  }

  export type DeliveryMethodType = 'PICKUP' | 'SHIPPING';

  /** Provider data associated with the delivery method. */
  export interface DeliveryProvider {
    code: string;
    data: unknown;
  }

  /** Delivery cost with payment model */
  export interface DeliveryCost {
    amount: Entity.Money;
    paymentModel: ShippingPaymentModel;
  }

  export type ShippingPaymentModel =
    | 'MERCHANT_COLLECTED'
    | 'CARRIER_DIRECT'
    | string;

  /** Payment aggregate for a checkout. */
  export interface Payment {
    payableAmount: Entity.Money;
    paymentMethods: PaymentMethod[];
    selectedPaymentMethod?: PaymentMethod | null;
  }

  /** Payment method available/selected for checkout. */
  export interface PaymentMethod {
    code: string;
    constraints?: PaymentMethodConstraints | null;
    flow: PaymentFlow;
    metadata?: unknown;
    provider: string;
  }

  /** Constraints for payment method availability. */
  export interface PaymentMethodConstraints {
    shippingMethods: string[];
  }

  export type PaymentFlow = 'ONLINE' | 'ON_DELIVERY' | string;

  /** A non-blocking warning generated by checkout operations. */
  export interface Notification {
    code: NotificationCode;
    id: string;
    isDismissed: boolean;
    severity: NotificationSeverity;
  }

  export type NotificationCode =
    | 'ITEM_UNAVAILABLE'
    | 'NOT_ENOUGH_STOCK'
    | 'OUT_OF_STOCK'
    | 'PRICE_CHANGED'
    | string;

  export type NotificationSeverity = 'INFO' | 'WARNING' | string;

  /** Recipient details for the delivery group. */
  export interface Recipient {
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    middleName?: string | null;
    phone?: string | null;
  }
}
