/* eslint-disable @typescript-eslint/no-namespace */
import type { model } from '@shopana/storefront-sdk';

/**
 * Checkout domain types namespace
 */
export namespace Checkout {
  export type Purchasable = model.ProductVariant;

  /**
   * Checkout domain entity shaped like API Checkout.
   * Nested types use domain primitives (e.g., Money) where applicable.
   */
  export interface Checkout {
    /** A globally-unique ID. */
    id: string;
    /** Sales channel the checkout belongs to. */
    channelCode: string;
    /** Locale the checkout was created with. */
    localeCode: string;
    /** Currency of every amount in the checkout. */
    currencyCode: string;
    /** Revision of the latest completed checkout calculation. */
    resultRevision: string;
    /** Lifecycle status; an order can be placed only from `READY`. */
    status: LifecycleStatus;
    /** When the checkout stops accepting `placeOrder`. */
    expiresAt: Date;
    /** Whether the latest calculation has no blocking issues. */
    valid: boolean;
    /** Issues produced by the latest calculation. */
    issues: Issue[];
    /** When this checkout was first created. */
    createdAt: Date;
    /** When this checkout was last updated. */
    updatedAt: Date;
    /** Quantity of the item being purchased. */
    totalQuantity: number;
    /** All cost calculations for the checkout. */
    cost: Cost;
    /** Root items in the checkout; bundle components are in `children`. */
    lines: Line[];
    /** Applied promo codes for the checkout. */
    appliedPromoCodes: PromoCode[];
    /** Customer identity associated with the checkout. */
    customerIdentity: CustomerIdentity;
    /** Customer note or special instructions for the checkout. */
    customerNote: string | null;
    /** Delivery groups. */
    deliveryGroups: DeliveryGroup[];
    /** Payment aggregate for this checkout. */
    payment: Payment;
    /** Notifications for the user regarding the checkout. */
    notifications: Notification[];
  }

  export type LifecycleStatus =
    | 'OPEN'
    | 'READY'
    | 'PLACED'
    | 'EXPIRED'
    | 'ABANDONED';

  /** Issue produced by a checkout calculation. */
  export interface Issue {
    code: string;
    /** Message from the API, shown as is. */
    message: string;
    severity: IssueSeverity;
    /** `STOP` blocks placing the order. */
    effect: IssueEffect;
    /** Path of the input field the issue refers to. */
    field: string[];
    lineId: string | null;
    retryable: boolean;
  }

  export type IssueSeverity = 'WARNING' | 'ERROR';

  export type IssueEffect = 'CONTINUE' | 'STOP';

  export interface Line {
    id: string;
    quantity: number;
    /** Title of the purchasable. */
    title: string;
    /** SKU of the purchasable. */
    sku: string | null;
    /** Cost calculations for this checkout item. */
    cost: LineCost;
    /** Price of the purchasable before bundle price adjustments. */
    originalPrice: model.Money;
    /** Price adjustment of a bundle component. */
    priceConfig: LinePriceConfig | null;
    /** Image URL of the purchasable. */
    imageSrc: string | null;
    /** Purchasable entity - full product data. */
    purchasable: Purchasable;
    /** ID of the purchasable. */
    purchasableId: string;
    /** How the line is purchased. */
    purchase: LinePurchase;
    /** Line attributes passed when the line was added. */
    attributes: Record<string, unknown>;
    /** Tag the line was added under. */
    tag: LineTag | null;
    /** Bundle component this line fulfils. */
    componentItemId: string | null;
    /** Bundle components. */
    children: Line[];
  }

  /**
   * Detailed breakdown of costs for a checkout line item
   */
  export interface LineCost {
    compareAtUnitPrice: model.Money;
    discountAmount: model.Money;
    subtotalAmount: model.Money;
    taxAmount: model.Money;
    totalAmount: model.Money;
    unitPrice: model.Money;
  }

  export interface LinePriceConfig {
    type: LinePriceType;
    /** Amount in minor units for amount-based adjustments. */
    amount: number | null;
    /** Percentage for percent-based adjustments. */
    percent: number | null;
  }

  export type LinePriceType =
    | 'FREE'
    | 'BASE'
    | 'DISCOUNT_AMOUNT'
    | 'DISCOUNT_PERCENT'
    | 'MARKUP_AMOUNT'
    | 'MARKUP_PERCENT'
    | 'OVERRIDE';

  export interface LinePurchase {
    type: LinePurchaseType;
  }

  export type LinePurchaseType = 'ONE_TIME';

  export interface LineTag {
    id: string;
    slug: string;
    unique: boolean;
  }

  /**
   * Cost breakdown for the entire checkout.
   */
  export interface Cost {
    subtotalAmount: model.Money;
    totalAmount: model.Money;
    totalDiscountAmount: model.Money;
    totalShippingAmount: model.Money;
    totalTaxAmount: model.Money;
  }

  /** Applied promo code for a checkout. */
  export interface PromoCode {
    appliedAt: Date;
    code: string;
    discountType: string;
    provider: string;
    value: number;
  }

  /** Customer identity associated with the checkout. */
  export interface CustomerIdentity {
    countryCode: string | null;
    /** Signed-in customer, if any. */
    customer: Customer | null;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    middleName: string | null;
    phone: string | null;
  }

  export interface Customer {
    id: string;
    displayName: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  }

  /** Delivery group for one or more checkout lines. */
  export interface DeliveryGroup {
    /** Unique identifier for the delivery group. */
    id: string;
    /** Checkout lines associated with the delivery group. */
    checkoutLines: Line[];
    /** Delivery address associated with the delivery group. */
    deliveryAddress: DeliveryAddress | null;
    /** Delivery methods available for the delivery group, in API order. */
    deliveryMethods: DeliveryMethod[];
    /** Recipient associated with the delivery group. */
    recipient: Recipient | null;
    /** Delivery method selection of the delivery group. */
    selection: DeliveryMethodSelection;
  }

  /** Delivery address associated with a checkout. */
  export interface DeliveryAddress {
    id: string | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    countryCode: string | null;
    /** Carrier-scoped address metadata. */
    data: unknown;
    postalCode: string | null;
    provinceCode: string | null;
    name: string;
    phone: string | null;
    country: string | null;
    province: string | null;
    formatted: string[];
    formattedArea: string | null;
  }

  /** Delivery method available for a checkout. */
  export interface DeliveryMethod {
    handle: string;
    code: string;
    title: string;
    description: string | null;
    /** Merchant-configured method type. */
    deliveryMethodType: DeliveryMethodType;
    /** Carrier code as returned by the API. */
    carrierCode: string | null;
    /** Provider module that renders the method. */
    provider: DeliveryProvider;
    cost: model.Money;
    /** Who collects the delivery charge; a `CARRIER_DIRECT` charge is not in the order total. */
    paymentModel: ShippingPaymentModel;
    estimatedMinDeliveryAt: Date | null;
    estimatedMaxDeliveryAt: Date | null;
    phoneRequired: boolean;
    /** JSON Schema of the customer input the method accepts. */
    customerInputContract: unknown;
    /** Public provider metadata returned by the checkout API. */
    publicData: unknown;
  }

  export type DeliveryMethodType =
    | 'LOCAL'
    | 'NONE'
    | 'PICK_UP'
    | 'PICKUP_POINT'
    | 'RETAIL'
    | 'SHIPPING';

  export type ShippingPaymentModel = 'MERCHANT_COLLECTED' | 'CARRIER_DIRECT';

  /** Provider data associated with the delivery method. */
  export interface DeliveryProvider {
    code: string;
  }

  export type SelectionStatus = 'NONE' | 'SELECTED' | 'RESET';

  /** Why the API dropped a previous selection. */
  export interface SelectionResetReason {
    code: string;
    /** Message from the API, shown as is. */
    message: string;
  }

  export interface DeliveryMethodSelection {
    status: SelectionStatus;
    option: DeliveryMethod | null;
    previousOptionHandle: string | null;
    resetReason: SelectionResetReason | null;
  }

  /** Payment aggregate for a checkout. */
  export interface Payment {
    payableAmount: model.Money;
    /** Payment methods in API order. */
    paymentMethods: PaymentMethod[];
    selection: PaymentMethodSelection;
  }

  /** Payment method available/selected for checkout. */
  export interface PaymentMethod {
    handle: string;
    code: string;
    title: string;
    flow: PaymentFlow;
    provider: PaymentProvider;
  }

  /** Provider data associated with the payment method. */
  export interface PaymentProvider {
    code: string;
  }

  export type PaymentFlow = 'ONLINE' | 'OFFLINE' | 'ON_DELIVERY';

  export interface PaymentMethodSelection {
    status: SelectionStatus;
    method: PaymentMethod | null;
    previousMethodHandle: string | null;
    resetReason: SelectionResetReason | null;
  }

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
    | 'PRICE_CHANGED';

  export type NotificationSeverity = 'INFO' | 'WARNING';

  /** Recipient details for the delivery group. */
  export interface Recipient {
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    middleName: string | null;
    phone: string | null;
  }
}
