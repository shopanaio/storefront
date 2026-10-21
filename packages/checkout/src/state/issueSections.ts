import { SectionId } from '#checkout/state/interface';
import type { Checkout } from '#checkout/types/entity';

const PROMO = new Set(['discountcodes', 'promocodes', 'appliedpromocodes']);
const LOYALTY = new Set(['loyaltyredemption', 'loyaltyreward', 'loyaltywallet']);
const PAYMENT = new Set(['payment', 'paymentmethod', 'payments']);
const CONTACT = new Set(['customer', 'customeridentity', 'contact', 'email', 'phone']);
const COMMENT = new Set(['customernote', 'note']);
const RECIPIENT = new Set(['recipient', 'recipients', 'deliveryrecipient', 'deliveryrecipients']);
const ADDRESS = new Set(['address', 'deliveryaddress', 'deliveryaddresses']);
const DELIVERY = new Set(['delivery', 'deliverygroups', 'deliverygroup', 'shipping']);

/**
 * Section an issue belongs to, by its `field` path (stage 5, task 1), or `null` when it names
 * none: issues of a line or of the whole checkout stay above the submit button. The path is
 * read loosely (case and the `cartIntent` wrapper do not matter), since validation functions
 * of apps name their own fields.
 */
export function issueSection(issue: Pick<Checkout.Issue, 'field' | 'lineId'>): SectionId | null {
  const path = issue.field.map((part) => String(part).toLowerCase());
  const parts = path[0] === 'cartintent' ? path.slice(1) : path;
  // Missing destinations are reported per line, but the buyer fixes them in the address section.
  if (parts[0] === 'delivery' && parts[1] === 'destinations') return SectionId.Address;
  if (issue.lineId) return null;
  const head = parts[0];
  if (!head) return null;
  if (PROMO.has(head)) return SectionId.Promo;
  if (LOYALTY.has(head)) return SectionId.Loyalty;
  if (PAYMENT.has(head)) return SectionId.Payment;
  if (CONTACT.has(head)) return SectionId.Contact;
  if (COMMENT.has(head)) return SectionId.Comment;
  if (RECIPIENT.has(head)) return SectionId.Recipient;
  if (ADDRESS.has(head)) return SectionId.Address;
  if (DELIVERY.has(head)) {
    if (parts.some((part) => ADDRESS.has(part))) return SectionId.Address;
    if (parts.some((part) => RECIPIENT.has(part))) return SectionId.Recipient;
    return SectionId.Delivery;
  }
  return null;
}
