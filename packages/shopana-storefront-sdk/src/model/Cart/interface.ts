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
    /** All units before discounts. */
    subtotalAmount: Money;
    /** Discount applied to the line. */
    discountAmount: Money;
    /** All units after discounts. */
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
  /** Discounts that make up `cost.discountAmount`, in the order pricing applied them. */
  discountAllocations: CartDiscountAllocation[];
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
  /** `points` in money at the program redemption rate; null when the program does not price them. */
  pointsValue: Money | null;
  /** Cashback credited to the store credit balance. */
  amount: Money | null;
  description: string | null;
}

/**
 * Buyer-facing automatic promotion of the store: server copy (headline, badge) in the request
 * language and the rule value. The admin title of the discount is never exposed.
 */
export interface StorefrontPromotion {
  key: string;
  kind: import('../../graphql/apollo/generated/operations').StorefrontPromotionKind;
  headline: string;
  badge: string;
  /** Up to 12 characters for the product card; null when the merchant left it empty. */
  shortBadge: string | null;
  description: { text: string; html: string } | null;
  accessibilityLabel: string;
  terms: string | null;
  value: {
    type: import('../../graphql/apollo/generated/operations').StorefrontPromotionValueType;
    /** Percentage such as 15 or 12.5. */
    percentage: number | null;
    amount: Money | null;
    maximumDiscount: Money | null;
    maximumShippingPrice: Money | null;
    buyQuantity: number | null;
    getQuantity: number | null;
  } | null;
  minimumSubtotal: Money | null;
  minimumQuantity: number | null;
  appliesOnOneTimePurchase: boolean;
  appliesOnSubscription: boolean;
  startsAt: Date;
  endsAt: Date | null;
  /** Storefront places the merchant chose for the promotion; at least one. */
  placements: readonly import('../../graphql/apollo/generated/operations').StorefrontPromotionPlacement[];
  /** What a buy X get Y promotion gives its benefit to; null for any other kind. */
  benefitScope:
    | import('../../graphql/apollo/generated/operations').StorefrontPromotionBenefitScope
    | null;
}

/** A variant a buy X get Y promotion gives its benefit to, as a promotion banner shows it. */
export interface PromotionBenefitOffer {
  variantId: string;
  variantHandle: string;
  /** Option values of the variant, e.g. "400 ml"; empty for the only variant. */
  variantTitle: string;
  product: {
    id: string;
    handle: string;
    title: string;
    vendorName: string | null;
  };
  imageUrl: string | null;
  price: Money | null;
  compareAtPrice: Money | null;
  /** One unit as the benefit: zero for a gift; null when not asked for or unknown. */
  benefitPrice: Money | null;
  availableForSale: boolean;
}

/** Minimum order requirement on the subtotal before discounts or on the item quantity. */
export interface CartPromotionRequirement {
  type: import('../../graphql/apollo/generated/operations').CheckoutPromotionRequirementType;
  required: Money | null;
  current: Money | null;
  remaining: Money | null;
  requiredQuantity: number | null;
  currentQuantity: number | null;
  remainingQuantity: number | null;
  /** Share of the requirement met, from 0 to 1. */
  ratio: number;
}

/**
 * Progress toward an automatic promotion with a minimum order requirement. For buy X get Y the
 * status and the requirement describe its next use.
 */
export interface CartPromotionProgress {
  /** Null once the discount is deleted. */
  promotion: StorefrontPromotion | null;
  status: import('../../graphql/apollo/generated/operations').CheckoutPromotionProgressStatus;
  requirement: CartPromotionRequirement;
  /**
   * Lines the requirement counts: the qualifier lines of buy X get Y and the target lines of a
   * product discount; empty for order and shipping discounts.
   */
  qualifierLineIds: readonly string[];
  /** Lines the applied discount lowered. */
  benefitLineIds: readonly string[];
  /** Uses of the applied promotion: buy X get Y counts its uses, any other at most one. */
  timesApplied: number;
  /** Benefit units buy X get Y still lacks once the requirement is met; zero otherwise. */
  missingBenefitQuantity: number;
  /**
   * The variants the merchant chose for the benefit of buy X get Y, such as the gifts to choose
   * from (a chosen product counts with its first available variant); null when the benefit is
   * chosen otherwise or for any other kind.
   */
  benefitOffers: readonly PromotionBenefitOffer[] | null;
}

/** Free shipping summary for a progress bar: promotions and loyalty free shipping. */
export interface CartFreeShippingProgress {
  status: import('../../graphql/apollo/generated/operations').CheckoutFreeShippingProgressStatus;
  /** What makes shipping free; null while IN_PROGRESS. */
  source:
    | import('../../graphql/apollo/generated/operations').CheckoutFreeShippingSource
    | null;
  /** Promotion headline, loyalty tier name or reward name. */
  title: string;
  promotion: StorefrontPromotion | null;
  /** Null for loyalty free shipping or a promotion without a minimum. */
  requirement: CartPromotionRequirement | null;
  /** Nearest published threshold when loyalty already makes shipping free. */
  nextRequirement: CartPromotionRequirement | null;
  /** Maximum shipping price the source covers; null without a limit. */
  maximumShippingPrice: Money | null;
  /** Null without a selected delivery or while IN_PROGRESS. */
  appliesToSelectedDelivery: boolean | null;
}

/** A discount pricing applied to the cart: an automatic one or a promo code. */
export interface CartDiscountApplication {
  method: import('../../graphql/apollo/generated/operations').CheckoutDiscountMethod;
  discountClass: import('../../graphql/apollo/generated/operations').CheckoutDiscountClass;
  /** Buyer-facing promotion headline. */
  title: string;
  /** The code the buyer entered; null for an automatic discount. */
  code: string | null;
  /** Null once the discount is deleted. */
  promotion: StorefrontPromotion | null;
}

/** The part of a discount that lowered the cost of a cart line. */
export interface CartDiscountAllocation {
  discountedAmount: Money;
  /** Units the discount covers unit by unit (buy X get Y); null when spread over the line amount. */
  quantity: number | null;
  /** Units of the line the discount made free. */
  freeQuantity: number;
  discountApplication: CartDiscountApplication;
}

/** Automatic discount applied to the cart; promo codes are in `promoCodes`. */
export interface CartAppliedPromotion {
  title: string;
  discountClass: import('../../graphql/apollo/generated/operations').CheckoutDiscountClass;
  amount: Money;
  promotion: StorefrontPromotion | null;
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
  promotionProgress: CartPromotionProgress[];
  /** Null when no free shipping is possible for this buyer and cart. */
  freeShippingProgress: CartFreeShippingProgress | null;
  appliedPromotions: CartAppliedPromotion[];
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
