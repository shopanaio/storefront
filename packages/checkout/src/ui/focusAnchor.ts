import { SectionId } from '#checkout/state/interface';
import { ADDRESS_SECTION_ANCHOR } from '#checkout/sections/address/anchor';

/** Id of the order summary: the promo codes, the rewards and the totals. */
export const SUMMARY_ANCHOR = 'checkout-summary';
/** Id of the lines of the order, for actions that send the buyer to them; on a phone they lead the page. */
export const LINES_ANCHOR = 'checkout-lines';

/**
 * Id of the checkout form. On a phone the submit button stands under the summary, out of the
 * form, and names it by this id.
 */
export const CHECKOUT_FORM_ID = 'checkout-form';

/** Id of the terms checkbox next to the submit button. */
export const TERMS_ANCHOR = 'checkout-terms';

/** Id of the element holding a section, for actions that send the buyer there. */
export function sectionAnchor(section: SectionId): string {
  if (section === SectionId.Address) return ADDRESS_SECTION_ANCHOR;
  // The promo code field is in the summary.
  if (section === SectionId.Promo) return SUMMARY_ANCHOR;
  return `checkout-section-${section}`;
}

/**
 * Fields first: a section header may hold a button of its own (log in), which is not where the
 * buyer has something to fill in.
 */
const FIELDS =
  'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])';
const CONTROLS = 'button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Brings an element into view and, unless `focus` is off, moves the focus to its first control. */
export function focusAnchor(
  id: string,
  { focus = true }: { focus?: boolean } = {}
): void {
  const element = document.getElementById(id);
  element?.scrollIntoView({
    behavior: 'smooth',
    block: focus ? 'center' : 'start',
  });
  if (focus) {
    const control =
      element?.querySelector<HTMLElement>(FIELDS) ??
      element?.querySelector<HTMLElement>(CONTROLS);
    control?.focus({ preventScroll: true });
  }
}
