import { ContactFormData } from "@src/modules/checkout/sections/contact/types";

/**
 * Form data type for the recipient section.
 *
 * The 'self' field is a derived UI state based on DB data:
 * - self=true: recipient is NULL in DB (uses customerIdentity)
 * - self=false: recipient exists in DB (another person, possibly with empty fields)
 *
 * Flow:
 * 1. User switches to "another person" -> empty recipient created in DB
 * 2. Section becomes invalid (empty required fields)
 * 3. User fills the form -> recipient updated in DB
 * 4. Section becomes valid
 *
 * Contact fields (firstName, lastName, phone) are required when self=false.
 */
export interface RecipientFormData extends Partial<ContactFormData> {
  /** Whether the recipient is the customer themselves (derived from DB) */
  self: boolean;
  /** ID of the delivery group this recipient belongs to */
  deliveryGroupId: string;
}
