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
 * The selection the checkout holds, as the buyer saved it. One mutation writes both choices, so
 * each write sends the other one as it is. It is read from `loyaltySelection`, not from the
 * applied quote: a choice the last calculation could not apply (the loyalty service did not
 * answer, the order fell below the minimum) stays chosen and is sent again.
 */
export function currentSelection(
  checkout: Checkout.Checkout
): LoyaltySelection {
  const saved = checkout.loyaltySelection;
  let redemption: RedemptionRequest | null = null;
  if (saved?.source === 'POINTS') {
    redemption = { source: 'POINTS', points: saved.points };
  } else if (saved?.source === 'STORE_CREDIT') {
    redemption = {
      source: 'STORE_CREDIT',
      amount: saved.amount ? String(saved.amount.amount) : null,
    };
  }
  return { redemption, rewardId: saved?.rewardId ?? null };
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
export function quoteNeedsRenewal(
  expiresAt: Date | null,
  now: number
): boolean {
  return (
    expiresAt !== null && expiresAt.getTime() - now < QUOTE_RENEWAL_MARGIN_MS
  );
}

/** A quote that expires within this time is renewed before `placeOrder` reserves it. */
export const QUOTE_RENEWAL_MARGIN_MS = 60_000;

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
