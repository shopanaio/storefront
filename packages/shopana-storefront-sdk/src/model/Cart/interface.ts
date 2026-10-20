import type { Money } from '../Money';
import type { ProductVariant } from '../Product/variant';

export type CartPurchasable = ProductVariant;

export interface CartLine {
  id: string;
  quantity: number;
  purchasableId: string;
  purchasable: CartPurchasable;
  cost: {
    unitPrice: Money;
    compareAtUnitPrice: Money | null;
    subtotalAmount: Money;
    totalAmount: Money;
  };
}

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
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalDiscountAmount: Money | null;
    totalTaxAmount: Money | null;
    totalShippingAmount: Money | null;
  };
  lines: CartLine[];
}
