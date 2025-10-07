import { ContactFormData } from "@src/modules/checkout/sections/contact/types";

/**
 * Form data type for the recipient section
 */
export interface RecipientFormData extends Partial<ContactFormData> {
  self: boolean;
  deliveryGroupId: string;
}
