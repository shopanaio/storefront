import { create } from 'zustand';
import type { Checkout } from '#checkout/types/entity';
import type {
  PaymentFlow,
  PlacementCustomerAction,
  PlacementPaymentFailure,
  PlacementStatus,
} from '#checkout/state/placement/types';

/**
 * What the buyer sees for the current placement attempt.
 * - `idle`: no attempt, or the last one left the checkout editable.
 * - `placing`: `placeOrder` is in flight.
 * - `redirecting`: the browser is leaving for the payment provider.
 * - `client-sdk`: a client SDK module handles the customer action.
 * - `awaiting-payment`: the placement is polled until the payment settles.
 * - `payment-incomplete`: the provider still waits for the buyer (back from the provider unpaid).
 * - `payment-failed`: the payment failed; the cart is intact and payment can be retried.
 * - `rejected`: the placement did not happen; `code` selects the message.
 * - `accepted`: the order is placed.
 */
export type PlacementPhase =
  | { name: 'idle' }
  | { name: 'placing' }
  | { name: 'redirecting'; url: string }
  | { name: 'client-sdk'; action: PlacementCustomerAction }
  | { name: 'awaiting-payment' }
  | { name: 'payment-incomplete'; url: string }
  | { name: 'payment-failed'; failure: PlacementPaymentFailure | null }
  | { name: 'rejected'; code: string }
  | {
      name: 'accepted';
      orderId: string | null;
      orderNumber: string | null;
      status: PlacementStatus;
      paymentFlow: PaymentFlow | null;
      /**
       * What the checkout estimated the order earns, shown until the order's own earning is
       * readable; `null` when unknown (e.g. after returning from the payment provider).
       */
      earningEstimate: Checkout.LoyaltyEarning | null;
    };

interface PlacementStoreState {
  phase: PlacementPhase;
  setPhase: (phase: PlacementPhase) => void;
  reset: () => void;
}

export const usePlacementStore = create<PlacementStoreState>((set) => ({
  phase: { name: 'idle' },
  setPhase: (phase) => set({ phase }),
  reset: () => set({ phase: { name: 'idle' } }),
}));

/** Phases during which the order cannot be submitted again (decision 1.12). */
export function isPlacementBusy(phase: PlacementPhase): boolean {
  return (
    phase.name === 'placing' ||
    phase.name === 'redirecting' ||
    phase.name === 'client-sdk' ||
    phase.name === 'awaiting-payment' ||
    phase.name === 'accepted'
  );
}

export function usePlacementPhase(): PlacementPhase {
  return usePlacementStore((state) => state.phase);
}

export function useIsPlacementBusy(): boolean {
  return usePlacementStore((state) => isPlacementBusy(state.phase));
}
