import type { ApiCheckoutDeliveryMethod } from '@codegen/schema-client';

/**
 * Delivery group data
 */
export interface DeliveryGroup {
  id: string;
  deliveryMethods: ApiCheckoutDeliveryMethod[];
}

/**
 * Form data type for the delivery section
 */
export interface DeliveryFormData {
  [key: string]: any;
}
