import type { ContactDto } from '@src/modules/checkout/core/contracts/dto';

/**
 * Form data type for the recipient section
 */
export interface RecipientFormData extends Partial<ContactDto> {
  self: boolean;
}
