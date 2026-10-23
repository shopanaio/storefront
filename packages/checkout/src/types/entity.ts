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
    /**
     * Whether the current buyer may fill in and place this checkout. False for a guest while
     * the store requires an account (S7): the buyer signs in first.
     */
    guestCheckoutAllowed: boolean;
    /**
     * When the checkout stops accepting `placeOrder`; `null` when the API sent no valid date,
     * so the browser does not expire it and the server status decides.
     */
    expiresAt: Date | null;
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
    /** Every promo code the buyer entered, in entry order, with its state. */
    promoCodes: PromoCode[];
    /** Customer identity associated with the checkout. */
    customerIdentity: CustomerIdentity;
    /** Customer note or special instructions for the checkout. */
    customerNote: string | null;
    /** Delivery groups. */
    deliveryGroups: DeliveryGroup[];
    /** Payment aggregate for this checkout. */
    payment: Payment;
    /**
     * Loyalty points or store credit the buyer pays with, as the latest calculation applied
     * them; `null` when none is selected or the selection could not be applied.
     */
    loyaltyRedemption: LoyaltyRedemption | null;
    /** Reward from `LoyaltyAccount.rewards` the latest calculation applied. */
    loyaltyRewardId: string | null;
    /**
     * The loyalty choice the buyer saved, kept when the calculation could not apply it (the
     * loyalty service did not answer, the order fell below the minimum); `null` when none.
     */
    loyaltySelection: LoyaltySelection | null;
    /** What placing the order is expected to earn; `null` when nothing or unknown. */
    loyaltyEarning: LoyaltyEarning | null;
    /**
     * Legal notice the buyer accepts by placing the order; `null` when the store links no
     * published policy, and then nothing is shown.
     */
    disclosures: Disclosures | null;
    /** Notifications for the user regarding the checkout. */
    notifications: Notification[];
  }

  export type DisclosuresAcceptanceMode = 'NOTICE' | 'CHECKBOX';

  export interface Disclosures {
    /** Version the buyer is shown; `placeOrder` sends it back. */
    version: string;
    /** `NOTICE`: placing the order is the acceptance; `CHECKBOX`: the buyer ticks a box. */
    acceptanceMode: DisclosuresAcceptanceMode;
    /** The notice split into text and policy links, in reading order. */
    parts: DisclosurePart[];
  }

  export type DisclosurePart =
    | { kind: 'text'; text: string }
    | {
        kind: 'policy';
        policyType: string;
        handle: string;
        title: string;
        /** Storefront path of the policy page. */
        path: string;
      };

  export type LoyaltySource = 'POINTS' | 'STORE_CREDIT';

  /**
   * Points and integer amounts of the loyalty program are strings: the API sends them so, and
   * they may exceed the safe integer range.
   */
  export interface LoyaltyRedemption {
    source: LoyaltySource;
    /** Points the buyer asked for; `null` for store credit or the maximum. */
    requestedPoints: string | null;
    /** Store credit the buyer asked for; `null` for points or the maximum. */
    requestedAmount: model.Money | null;
    /** Points spent; `null` for store credit. */
    points: string | null;
    /** Available points; `null` for store credit. */
    availablePoints: string | null;
    /** Available balance of the source in money. */
    availableAmount: model.Money;
    /** Amount paid with the source. */
    discount: model.Money;
    /** When the quote stops being valid; the checkout renews it before placing the order. */
    expiresAt: Date | null;
  }

  /** What the buyer asked for: `null` points and amount mean the most the order allows. */
  export interface LoyaltySelection {
    /** `null` when only a reward is chosen. */
    source: LoyaltySource | null;
    points: string | null;
    amount: model.Money | null;
    rewardId: string | null;
  }

  export interface LoyaltyEarning {
    /** `AUTHENTICATION_REQUIRED`: a guest would earn it after signing in. */
    state: 'AVAILABLE' | 'AUTHENTICATION_REQUIRED';
    points: string;
    /** Cashback to the store credit balance. */
    amount: model.Money | null;
    /** Server-authored text, shown as is. */
    headline: string;
    description: string | null;
  }

  /** The signed-in customer's account in the store's loyalty program. */
  export interface LoyaltyAccount {
    id: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
    availablePoints: string;
    pendingPoints: string;
    tier: LoyaltyTier | null;
    /** The nearest points expiration. */
    nextExpiration: { points: string; expiresAt: Date } | null;
    /** Store credit of the program currency; `null` when none was ever issued. */
    storeCredit: LoyaltyStoreCredit | null;
    /** Sources the customer can pay with, in API order; empty when none has a balance. */
    sources: LoyaltySourceOption[];
    /** Rewards the customer can use now, in API order. */
    rewards: LoyaltyReward[];
  }

  export interface LoyaltyStoreCredit {
    availableAmount: model.Money;
    pendingAmount: model.Money;
    /** The nearest store credit expiration. */
    nextExpiration: { amount: model.Money; expiresAt: Date } | null;
  }

  export interface LoyaltyTier {
    name: string;
    /** Multiplier of purchase points in basis points (`15000` = ×1.5). */
    earnMultiplierBps: number;
    /** Server-authored progress to the next tier; `null` on the top tier. */
    progress: string | null;
  }

  export interface LoyaltySourceOption {
    source: LoyaltySource;
    availablePoints: string | null;
    availableAmount: model.Money;
    minimum: LoyaltyBound;
    /** Program limit per order; `null` without one. */
    maximumPerOrder: LoyaltyBound | null;
  }

  export interface LoyaltyBound {
    /** `null` for store credit. */
    points: string | null;
    amount: model.Money;
  }

  export type LoyaltyRewardKind =
    | 'POINTS'
    | 'CASHBACK'
    | 'STORE_CREDIT'
    | 'VOUCHER'
    | 'FIXED_DISCOUNT'
    | 'PERCENTAGE_DISCOUNT'
    | 'FREE_SHIPPING'
    | 'FREE_PRODUCT'
    | 'MEMBER_BENEFIT';

  export interface LoyaltyReward {
    id: string;
    kind: LoyaltyRewardKind;
    /** Server-authored text, shown as is. */
    headline: string;
    description: string | null;
    validUntil: Date | null;
    /** Promo code of a voucher; the checkout enters it together with the reward. */
    voucherCode: string | null;
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
    /** Line attributes passed when the line was added, as the API returns them (JSON). */
    attributes: unknown;
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
    /** Promotions on items and delivery. */
    totalDiscountAmount: model.Money;
    /** Promotions on items only, for a summary that shows shipping after its discounts. */
    merchandiseDiscountAmount: model.Money;
    /** Shipping before shipping discounts; loyalty free shipping is already taken off. */
    totalShippingAmount: model.Money;
    totalTaxAmount: model.Money;
    /** Paid with loyalty points or store credit; not part of `totalDiscountAmount`. */
    loyaltyAmount: model.Money;
  }

  /**
   * A promo code the buyer entered. It stays in the checkout until the buyer removes it; a
   * pending or rejected code applies again once its condition is met.
   */
  export interface PromoCode {
    code: string;
    status: PromoCodeStatus;
    /** Why the code is not applied (`AWAITING_DELIVERY`, a rejection reason); null if applied. */
    reason: string | null;
    /** Message from the API about the reason, shown as is; null if applied. */
    message: string | null;
    /** The fields below are set only for an applied code. */
    appliedAt: Date | null;
    discountType: string | null;
    provider: string | null;
    value: number | null;
  }

  export type PromoCodeStatus = 'APPLIED' | 'PENDING' | 'REJECTED';

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
    /**
     * Earlier identifiers of the group, newest first: the id changes with the lines, and a
     * mutation naming a replaced id applies to this group.
     */
    replacesGroupIds: string[];
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
    /** Shipping settlement of the selected option; `null` while no option is selected. */
    shipping: DeliveryGroupShipping | null;
  }

  /**
   * What the shipment of a group costs, as the server settled it: the price before free
   * shipping, who pays the carrier, the amount charged at checkout and why it is free.
   */
  export interface DeliveryGroupShipping {
    paymentModel: ShippingPaymentModel;
    /**
     * Price before free shipping: the charge of a `MERCHANT_COLLECTED` option, or the carrier
     * estimate of a `CARRIER_DIRECT` one; `null` when the carrier price is unknown.
     */
    originalPrice: model.Money | null;
    /** `RECIPIENT`: the carrier charges the recipient on delivery, nothing is charged at checkout. */
    payer: ShippingPayer;
    /** Amount charged at checkout for the group. */
    total: model.Money;
    freeShipping: FreeShipping | null;
  }

  export type ShippingPayer = 'MERCHANT' | 'RECIPIENT';

  export type FreeShippingSource =
    | 'DISCOUNT'
    | 'LOYALTY_TIER'
    | 'LOYALTY_REWARD';

  /** Why the shipping of a group is free; the server applies it on its own. */
  export interface FreeShipping {
    source: FreeShippingSource;
    /** Buyer-facing reason: the discount title, the loyalty tier name or the reward name. */
    title: string;
    /** Promo code that made shipping free; `null` for an automatic discount or loyalty. */
    code: string | null;
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
    /** Carrier price estimate of a `CARRIER_DIRECT` option; `null` otherwise or when unknown. */
    carrierEstimatedCost: model.Money | null;
    estimatedMinDeliveryAt: Date | null;
    estimatedMaxDeliveryAt: Date | null;
    /**
     * Whether the carrier needs the phone of the recipient (stage 4, item 5). The checkout asks
     * for the contact phone, and for the recipient phone of another person, with every method,
     * so this flag does not change the forms today; it is kept for methods that will not.
     */
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
    /**
     * Customer input the API saved for the selected (or reset) method of the group, such as
     * the branch; the method keeps it until it is cleared or the destination changes.
     */
    customerInput: unknown;
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
