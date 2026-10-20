import { SectionId } from '#checkout/state/interface';
import { issueSection } from '#checkout/state/issueSections';
import type { Checkout } from '#checkout/types/entity';

/**
 * What a loyalty issue of the checkout means for the buyer:
 * - `reduced`: the amount was lowered to the most the order allows;
 * - `dropped`: the order total fell below the minimum, nothing is redeemed;
 * - `retry`: the loyalty service did not answer, the same selection may work again;
 * - `redemption`: the chosen points or store credit cannot be used;
 * - `reward`: the chosen reward is no longer available;
 * - `rewardInactive`: the reward's discount does not apply to this order (a store setting);
 * - `signIn`: the buyer must sign in to use the program.
 */
export type LoyaltyIssueKind =
  | 'reduced'
  | 'dropped'
  | 'retry'
  | 'redemption'
  | 'reward'
  | 'rewardInactive'
  | 'signIn';

export interface LoyaltyIssue {
  kind: LoyaltyIssueKind;
  issue: Checkout.Issue;
  /** It blocks placing the order. */
  blocking: boolean;
}

const SIGN_IN_CODES = new Set(['CUSTOMER_REQUIRED']);
const REWARD_CODE = /ENTITLEMENT|REWARD/;

/** Whether the issue is about the loyalty selection (its `field` names it). */
export function isLoyaltyIssue(issue: Checkout.Issue): boolean {
  return issueSection(issue) === SectionId.Loyalty;
}

export function classifyLoyaltyIssue(
  issue: Checkout.Issue,
  redemption: Checkout.LoyaltyRedemption | null
): LoyaltyIssue {
  const blocking = issue.effect === 'STOP';
  const kind = ((): LoyaltyIssueKind => {
    if (issue.code === 'LOYALTY_REDEMPTION_REDUCED') {
      return redemption ? 'reduced' : 'dropped';
    }
    if (SIGN_IN_CODES.has(issue.code)) return 'signIn';
    if (issue.code === 'REWARD_DISCOUNT_NOT_APPLIED') return 'rewardInactive';
    if (REWARD_CODE.test(issue.code)) return 'reward';
    if (!blocking && issue.retryable) return 'retry';
    return 'redemption';
  })();
  return { kind, issue, blocking };
}

/** Loyalty issues of the checkout, one per kind, the blocking one first. */
export function loyaltyIssues(checkout: Checkout.Checkout): LoyaltyIssue[] {
  const byKind = new Map<LoyaltyIssueKind, LoyaltyIssue>();
  for (const issue of checkout.issues) {
    if (!isLoyaltyIssue(issue)) continue;
    const item = classifyLoyaltyIssue(issue, checkout.loyaltyRedemption);
    const known = byKind.get(item.kind);
    if (!known || (item.blocking && !known.blocking)) byKind.set(item.kind, item);
  }
  return [...byKind.values()];
}

/** Message key (Checkout namespace) of a redemption that cannot be used, by its code. */
export function redemptionIssueMessageKey(
  issue: Pick<Checkout.Issue, 'code'>,
  source: Checkout.LoyaltySource
): string {
  if (source === 'STORE_CREDIT') return 'loyalty-banner-store-credit-failed';
  switch (issue.code) {
    case 'REQUEST_EXCEEDS_AVAILABLE_POINTS':
    case 'NO_AVAILABLE_POINTS':
      return 'loyalty-banner-points-insufficient';
    case 'BELOW_MINIMUM_REDEMPTION':
      return 'loyalty-banner-points-below-minimum';
    case 'LOYALTY_REDEMPTION_UNAVAILABLE':
      return 'loyalty-banner-points-unavailable';
    default:
      return 'loyalty-banner-points-not-applicable';
  }
}

/** Source a redemption issue is about: the saved selection decides, else the issue field. */
export function issueSource(
  issue: Pick<Checkout.Issue, 'field'>,
  selected: Checkout.LoyaltySource | null
): Checkout.LoyaltySource {
  if (selected) return selected;
  return issue.field[1] === 'amount' ? 'STORE_CREDIT' : 'POINTS';
}
