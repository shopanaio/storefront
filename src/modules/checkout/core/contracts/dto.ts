/**
 * Strongly-typed DTOs for Checkout domain.
 */

// Contact and Recipient
export interface ContactDto {
  userFirstName?: string;
  userLastName?: string;
  userMiddleName?: string;
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
export interface PaymentSectionDto {
  /** Selected payment method code */
  methodCode: string;
  /** Transport-agnostic provider form data */
  data: unknown;
}

export interface DeliverySectionDto {
  /** Selected delivery method code */
  methodCode: string;
  /** Transport-agnostic provider form data */
  data: unknown;
}

// Promo / Comment
export interface PromoDto { code: string }
export interface CommentDto { comment: string }

// Aggregated submit payload
export interface SubmitDeliveryDto {
  groupId: string;
  methodCode: string;
  data: unknown;
}

export interface SubmitPaymentDto {
  methodCode: string;
  data: unknown;
}

export interface SubmitCheckoutDto {
  contact?: unknown;
  recipient?: unknown;
  deliveries?: SubmitDeliveryDto[];
  address?: unknown;
  payment?: SubmitPaymentDto;
  promo?: unknown;
  comment?: string;
}

// Section DTO map by static section ids; dynamic delivery uses DeliverySectionDto
export interface SectionDtoMap {
  contact: ContactDto;
  recipient: RecipientDto;
  address: AddressDto;
  payment: PaymentSectionDto;
  promo: PromoDto;
  comment: CommentDto;
}
