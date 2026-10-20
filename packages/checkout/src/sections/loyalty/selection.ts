import { create } from 'zustand';
import type { Checkout } from '#checkout/types/entity';
import type { CheckoutLoyaltyRedemptionUpdateInput } from '#checkout/graphql/operations';

/** What the buyer pays with: `null` points or amount means the most the order allows. */
export type RedemptionRequest =
  | { source: 'POINTS'; points: string | null }
  | { source: 'STORE_CREDIT'; amount: string | null };

/** The reward to use, with the voucher code the checkout enters for it. */
export interface RewardChoice {
  id: string;
  voucherCode: string | null;
}

/** Everything the buyer chose in the loyalty program for this checkout. */
export interface LoyaltySelection {
  redemption: RedemptionRequest | null;
  rewardId: string | null;
}

/**
 * The selection the checkout holds. One mutation writes both choices, so each write sends the
 * other one as it is. A redemption the last calculation could not apply comes back as `null`
 * and is not sent again.
 */
export function currentSelection(checkout: Checkout.Checkout): LoyaltySelection {
  const applied = checkout.loyaltyRedemption;
  let redemption: RedemptionRequest | null = null;
  if (applied?.source === 'POINTS') {
    redemption = { source: 'POINTS', points: applied.requestedPoints };
  } else if (applied?.source === 'STORE_CREDIT') {
    redemption = {
      source: 'STORE_CREDIT',
      amount: applied.requestedAmount ? String(applied.requestedAmount.amount) : null,
    };
  }
  return { redemption, rewardId: checkout.loyaltyRewardId };
}

/** Input of `checkoutLoyaltyRedemptionUpdate`, or `null` when nothing is chosen (remove). */
export function selectionInput(
  selection: LoyaltySelection
): Omit<CheckoutLoyaltyRedemptionUpdateInput, 'checkoutId'> | null {
  const { redemption, rewardId } = selection;
  if (!redemption && !rewardId) return null;
  return {
    source: redemption?.source ?? null,
    points: redemption?.source === 'POINTS' ? redemption.points : null,
    amount: redemption?.source === 'STORE_CREDIT' ? redemption.amount : null,
    rewardId,
  };
}

/** Whether a quote expiring at `expiresAt` must be renewed before placing the order. */
export function quoteNeedsRenewal(expiresAt: Date | null, now: number): boolean {
  return expiresAt !== null && expiresAt.getTime() - now < QUOTE_RENEWAL_MARGIN_MS;
}

/** A quote that expires within this time is renewed before `placeOrder` reserves it. */
export const QUOTE_RENEWAL_MARGIN_MS = 60_000;

interface LoyaltyIntentStore {
  /** Source the buyer last chose per checkout, for a selection the API could not apply. */
  sources: Record<string, Checkout.LoyaltySource | null>;
  setSource: (checkoutId: string, source: Checkout.LoyaltySource | null) => void;
}

/**
 * The source the buyer chose last. When a selection cannot be applied the checkout returns no
 * redemption, while its issue still names the choice; the block shows that choice as not
 * applied instead of as switched off.
 */
export const useLoyaltyIntent = create<LoyaltyIntentStore>((set) => ({
  sources: {},
  setSource: (checkoutId, source) =>
    set((state) => ({ sources: { ...state.sources, [checkoutId]: source } })),
}));

interface LoyaltyWritesStore {
  /** Loyalty writes running now. */
  running: number;
  track: <T>(write: Promise<T>) => Promise<T>;
}

/** Loyalty writes in progress, for controls outside the block (the banner actions). */
export const useLoyaltyWrites = create<LoyaltyWritesStore>((set) => ({
  running: 0,
  track: async (write) => {
    set((state) => ({ running: state.running + 1 }));
    try {
      return await write;
    } finally {
      set((state) => ({ running: state.running - 1 }));
    }
  },
}));
