import type { Checkout } from '#checkout/types/entity';
import { SectionId } from '#checkout/state/interface';
import { issueSection } from '#checkout/state/issueSections';

/** Message keys (Checkout namespace) of the issue codes the backend itself produces. */
const ISSUE_KEYS: Record<string, string> = {
  CART_EMPTY: 'issue-cart-empty',
  LINE_UNAVAILABLE: 'issue-line-unavailable',
  LINE_QUANTITY_EXCEEDED: 'issue-line-quantity-exceeded',
  DELIVERY_ADDRESS_REQUIRED: 'issue-delivery-address-required',
  DELIVERY_OPTIONS_UNAVAILABLE: 'issue-delivery-options-unavailable',
  DELIVERY_OPTION_REQUIRED: 'issue-delivery-option-required',
  DELIVERY_OPTION_INVALID: 'issue-delivery-option-invalid',
  LOYALTY_REDEMPTION_UNAVAILABLE: 'issue-loyalty-redemption-unavailable',
  LOYALTY_REDEMPTION_REDUCED: 'issue-loyalty-redemption-reduced',
  PAYMENT_METHODS_UNAVAILABLE: 'issue-payment-methods-unavailable',
  PAYMENT_METHOD_REQUIRED: 'issue-payment-method-required',
  PAYMENT_METHOD_INVALID: 'issue-payment-method-invalid',
};

export interface IssueMessage {
  key: string;
  /** Section to name in the text, for an unknown code. */
  section?: SectionId;
}

/**
 * Text of a checkout issue, chosen by `code` on the frontend: the API sends English texts,
 * and validation functions of apps send their own. An unknown code names the section to
 * check, or the whole order when the issue has no section.
 */
export function issueMessage(
  issue: Pick<Checkout.Issue, 'code' | 'field' | 'lineId'>
): IssueMessage {
  const key = ISSUE_KEYS[issue.code];
  if (key) return { key };
  if (issue.code.startsWith('DISCOUNT_CODE_REJECTED')) {
    return { key: 'issue-discount-code-rejected' };
  }
  const section = issueSection(issue);
  if (section) return { key: 'issue-check-section', section };
  return { key: 'issue-check-order' };
}

/**
 * Blocking issues to show. While some lines cannot be delivered, their own banner and the
 * delivery section already say so; `DELIVERY_OPTIONS_UNAVAILABLE` would repeat it.
 */
export function visibleBlockingIssues(
  blocking: Checkout.Issue[],
  undeliverableCount: number
): Checkout.Issue[] {
  return undeliverableCount > 0
    ? blocking.filter((issue) => issue.code !== 'DELIVERY_OPTIONS_UNAVAILABLE')
    : blocking;
}

/** Message key of a delivery or payment selection the API reset, by its reason code. */
export function resetReasonMessageKey(
  reason: Checkout.SelectionResetReason,
  section: SectionId.Delivery | SectionId.Payment
): string {
  if (section === SectionId.Payment) return 'payment-selection-reset-title';
  if (reason.code === 'DELIVERY_OPTION_TEMPORARILY_UNAVAILABLE') {
    return 'delivery-selection-reset-unavailable';
  }
  if (reason.code === 'DELIVERY_CUSTOMER_INPUT_INVALID') {
    return 'delivery-selection-reset-input';
  }
  return 'delivery-selection-reset-title';
}

type Translate = (
  key: string,
  values?: Record<string, string | number>
) => string;

/** Text of a checkout issue in the buyer's language. */
export function issueText(
  t: Translate,
  issue: Pick<Checkout.Issue, 'code' | 'field' | 'lineId'>
): string {
  const message = issueMessage(issue);
  return message.section
    ? t(message.key, { section: t(message.section) })
    : t(message.key);
}
