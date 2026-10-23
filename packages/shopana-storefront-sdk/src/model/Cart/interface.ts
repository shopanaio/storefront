import type { Money } from '../Money';
import type { ProductVariant } from '../Product/variant';
import type { CheckoutLinePurchaseType } from '../../graphql/apollo/generated/operations';

export type CartPurchasable = ProductVariant;

/** Option of the purchased variant as the buyer sees it, e.g. "Flavour: BBQ". */
export interface CartLineOption {
  name: string;
  value: string;
}

/** Image of the purchasable shown for the line. */
export interface CartLineImage {
  url: string;
  width: number | null;
  height: number | null;
  alt: string | null;
}

/** Tag the line was added with; a `unique` tag keeps one line per checkout. */
export interface CartLineTag {
  id: string;
  slug: string;
  unique: boolean;
}

interface CartLineBase {
  id: string;
  quantity: number;
  purchasableId: string;
  cost: {
    unitPrice: Money;
    compareAtUnitPrice: Money | null;
    subtotalAmount: Money;
    totalAmount: Money;
  };
}

/** A line confirmed by the server. */
export interface ConfirmedCartLine extends CartLineBase {
  isOptimistic: false;
  purchasable: CartPurchasable;
  /** Title of the purchasable as the checkout captured it. */
  title: string;
  image: CartLineImage | null;
  tag: CartLineTag | null;
  /** Line attributes as the API returns them (JSON). */
  attributes: object;
  purchaseType: CheckoutLinePurchaseType;
  /** Parent bundle line; null for a root line. */
  parentId: string | null;
  /** Component item of the parent bundle this child line fills; null for a root line. */
  componentItemId: string | null;
  /** Selected options of the variant. */
  options: CartLineOption[];
  /** Components of a bundle line; the server confirms them with their parent. */
  children: ConfirmedCartLine[];
  /** The variant is out of stock but still sold (backorder). */
  currentlyNotInStock: boolean;
}

/**
 * A line added on the client and not confirmed yet. Only what the buyer asked for is known; the
 * server answer replaces it with a confirmed line.
 */
export interface OptimisticCartLine extends CartLineBase {
  isOptimistic: true;
  purchasable: CartPurchasable | null;
}

export type CartLine = ConfirmedCartLine | OptimisticCartLine;

export interface CheckoutLoyaltyRedemption {
  quoteId: string;
  revision: string;
  accountId: string;
  programId: string;
  programCode: string;
  programVersion: number;
  source: import('../../graphql/apollo/generated/operations').LoyaltyRedemptionSource;
  /** Points the buyer asked for; null for store credit or the maximum. */
  requestedPoints: number | null;
  /** Store credit the buyer asked for; null for points or the maximum. */
  requestedAmount: Money | null;
  /** Points spent; null for store credit. */
  points: number | null;
  /** Available points; null for store credit. */
  availablePoints: number | null;
  /** Available balance of the selected source in money. */
  availableAmount: Money;
  discount: Money;
  payableAfterLoyalty: Money;
  expiresAt: Date;
}

/** Problem the checkout pipeline reports; `lineId` ties it to a line. */
export interface CartIssue {
  code: string;
  message: string;
  severity: import('../../graphql/apollo/generated/operations').CheckoutIssueSeverity;
  effect: import('../../graphql/apollo/generated/operations').CheckoutIssueEffect;
  field: readonly string[];
  lineId: string | null;
  retryable: boolean;
}

/** Change the checkout made to the cart on its own, e.g. a reduced quantity. */
export interface CartNotification {
  code: import('../../graphql/apollo/generated/operations').CheckoutNotificationCode;
  severity: import('../../graphql/apollo/generated/operations').NotificationSeverity;
  isDismissed: boolean;
}

/** Promo code the buyer entered, with its state. */
export interface CartPromoCode {
  code: string;
  status: import('../../graphql/apollo/generated/operations').CheckoutPromoCodeStatus;
  /** Why the code is not applied; null for an applied code. */
  reason: string | null;
  /** Buyer-facing explanation of the reason; null for an applied code. */
  message: string | null;
}

/** Points and cashback the order is expected to earn. */
export interface CartLoyaltyEarning {
  state: import('../../graphql/apollo/generated/operations').CheckoutLoyaltyEarningState;
  points: number;
  amount: Money | null;
  headline: string;
  description: string | null;
}

export interface Cart {
  id: string;
  status: import('../../graphql/apollo/generated/operations').CheckoutLifecycleStatus;
  expiresAt: Date;
  resultRevision: string;
  valid: boolean;
  loyaltyRedemption: CheckoutLoyaltyRedemption | null;
  loyaltyRewardId: string | null;

  createdAt: Date;
  updatedAt: Date;
  totalQuantity: number;
  /** Whether the current buyer may place this checkout without signing in first. */
  guestCheckoutAllowed: boolean;
  issues: CartIssue[];
  notifications: CartNotification[];
  promoCodes: CartPromoCode[];
  loyaltyEarning: CartLoyaltyEarning | null;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalDiscountAmount: Money;
    totalTaxAmount: Money;
    totalShippingAmount: Money;
    /** Promotions on items only, without shipping discounts. */
    merchandiseDiscountAmount: Money;
    /** Paid with loyalty points or store credit. */
    loyaltyAmount: Money;
  };
  lines: CartLine[];
}
