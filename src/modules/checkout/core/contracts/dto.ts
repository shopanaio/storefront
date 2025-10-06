/**
 * Strongly-typed DTOs for Checkout domain.
 */

// Contact and Recipient
export interface ContactDto {
  userFirstName: string;
  userLastName: string;
  userMiddleName: string;
  userPhone: string;
}

export interface RecipientDtoSelf {
  self: true;
}

export interface RecipientDtoOther extends Omit<ContactDto, 'userPhone'> {
  self: false;
  userPhone?: string;
}

export type RecipientDto = RecipientDtoSelf | RecipientDtoOther;

// Address
export interface AddressDto {
  city?: unknown; // keep transport-agnostic; UI maps concrete type to unknown
}

// Payment / Shipping (section-level DTOs)
export interface PaymentDto {
  provider: string;
  /** Selected payment method code */
  methodCode: string;
  /** Transport-agnostic provider form data */
  data: unknown;
}

export type DeliveryDto = {
  /** Group ID */
  groupId: string;
  /** Provider */
  provider: string;
  /** Method code */
  methodCode: string;
  /** Data */
  data: unknown;
};

// Promo / Comment
export interface PromoDto {
  code: string;
}
export interface CommentDto {
  comment: string;
}

export interface SectionDtoMap {
  contact: ContactDto;
  recipient: RecipientDto;
  address: AddressDto;
  delivery: DeliveryDto;
  payment: PaymentDto;
  promo: PromoDto;
  comment: CommentDto;
}
