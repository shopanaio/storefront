import type {
  AttemptJournal,
  PlacementAttempt,
} from '#checkout/state/placement/attemptJournal';
import type { PlacementPhase } from '#checkout/state/placement/placementStore';
import type {
  PlacementOutcome,
  PlacementResult,
} from '#checkout/state/placement/types';
import { DISCLOSURES_CHANGED_CODE } from '#checkout/state/placement/outcome';

/**
 * How an outcome was reached:
 * - `submit`: the buyer just pressed the button, so a redirect is followed at once;
 * - `recover`: the placement was read back (reload, return page, second tab), so a pending
 *   redirect is offered as "continue payment" instead of sending the buyer away unasked.
 */
export type PlacementContext = 'submit' | 'recover';

export function phaseForOutcome(
  outcome: PlacementOutcome,
  context: PlacementContext
): PlacementPhase {
  switch (outcome.kind) {
    case 'accepted':
      return {
        name: 'accepted',
        orderId: outcome.orderId,
        orderNumber: outcome.orderNumber,
        status: outcome.status,
        paymentFlow: outcome.paymentFlow,
        earningEstimate: null,
      };
    case 'redirect':
      return context === 'submit'
        ? { name: 'redirecting', url: outcome.url }
        : { name: 'payment-incomplete', url: outcome.url };
    case 'client-sdk':
      return { name: 'client-sdk', action: outcome.action };
    case 'awaiting-payment':
      return { name: 'awaiting-payment' };
    case 'payment-failed':
      return { name: 'payment-failed', failure: outcome.failure };
    case 'rejected':
      return { name: 'rejected', code: outcome.code };
  }
}

/**
 * Records an outcome in the attempt journal so that the key never sticks:
 * - a placed order or a final rejection removes the attempt;
 * - a failed payment marks it failed, so the retry takes a new key (decision 1.7);
 * - a retryable rejection keeps it `sent`, so the retry reuses the key, except changed
 *   disclosures: the retry carries another version;
 * - a placement in progress is kept for recovery.
 */
export function recordOutcome(
  journal: AttemptJournal,
  attempt: PlacementAttempt,
  result: PlacementResult,
  outcome: PlacementOutcome
): PlacementAttempt | null {
  switch (outcome.kind) {
    case 'accepted':
      journal.clear(attempt.checkoutId);
      return null;
    case 'rejected':
      // Changed disclosures are answered before anything is placed, and the next press sends
      // another version: the key is not kept for a retry of this request.
      if (outcome.retryable && outcome.code !== DISCLOSURES_CHANGED_CODE) {
        return attempt;
      }
      journal.clear(attempt.checkoutId);
      return null;
    case 'payment-failed':
      return journal.markFailed(attempt, result);
    default:
      return journal.markResolved(attempt, result);
  }
}
