import type { Checkout } from '@src/modules/checkout/types/entity';
import type { DeliveryFormData, DeliveryGroup, DeliveryMethod } from './types';

/**
 * Maps Checkout.Checkout entity to DeliveryFormData
 * Extracts delivery groups and their selected delivery methods
 */
export function mapCheckoutToDeliveryFormData(
  checkout: Checkout.Checkout | null
): DeliveryFormData | null {
  if (!checkout) {
    return null;
  }

  const formData: DeliveryFormData = {};

  for (const group of checkout.deliveryGroups) {
    const deliveryMethods: DeliveryMethod[] = group.deliveryMethods.map(
      (method) => ({
        code: method.code,
        provider: method.provider.code,
        data: method.provider.data,
      })
    );

    const selectedDeliveryMethod: DeliveryMethod | null =
      group.selectedDeliveryMethod
        ? {
            code: group.selectedDeliveryMethod.code,
            provider: group.selectedDeliveryMethod.provider.code,
            data: group.selectedDeliveryMethod.provider.data,
          }
        : deliveryMethods[0] ?? null;

    if (selectedDeliveryMethod) {
      const deliveryGroup: DeliveryGroup = {
        id: group.id,
        deliveryMethods,
        selectedDeliveryMethod,
      };

      formData[group.id] = deliveryGroup;
    }
  }

  return Object.keys(formData).length > 0 ? formData : null;
}
