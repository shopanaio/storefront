import type { ApiCheckoutDeliveryMethod } from '@codegen/schema-client';

export interface DeliveryMethod {
  code: string;
  provider: string;
  data: unknown;
}
/**
 * Delivery group data
 */
export interface DeliveryGroup {
  id: string;
  deliveryMethods: DeliveryMethod[];
  selectedDeliveryMethod: DeliveryMethod;
}

/**
 * Form data type for the delivery section
 */
export interface DeliveryFormData {
  [key: string]: DeliveryGroup;
}
