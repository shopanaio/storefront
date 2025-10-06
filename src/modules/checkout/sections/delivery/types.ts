import type { ApiCheckoutDeliveryMethod } from '@codegen/schema-client';

/**
 * Delivery group data
 */
export interface DeliveryGroup {
  id: string;
  deliveryMethods: ApiCheckoutDeliveryMethod[];
}
