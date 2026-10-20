import { SectionId } from '#checkout/state/interface';
import { ADDRESS_SECTION_ANCHOR } from '#checkout/sections/address/anchor';

/** Id of the order summary, for actions that send the buyer to the lines. */
export const SUMMARY_ANCHOR = 'checkout-summary';

/** Id of the element holding a section, for actions that send the buyer there. */
export function sectionAnchor(section: SectionId): string {
  if (section === SectionId.Address) return ADDRESS_SECTION_ANCHOR;
  // The promo code field is in the summary.
  if (section === SectionId.Promo) return SUMMARY_ANCHOR;
  return `checkout-section-${section}`;
}

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
    element
      ?.querySelector<HTMLElement>('input, button, textarea, [tabindex]')
      ?.focus({ preventScroll: true });
  }
}
