import type { Checkout } from '@src/modules/checkout/types/entity';
import type { DeliveryFormData, DeliveryGroup, DeliveryMethod, DeliveryAddress } from './types';
import type { City } from './components/city/CitySelect';

/**
 * Maps Checkout.Checkout entity to DeliveryFormData
 * Extracts delivery groups, their selected delivery methods, and address data
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

    // Extract address data from delivery group
    const address: DeliveryAddress = group.deliveryAddress
      ? {
          addressId: group.deliveryAddress.id,
          city: group.deliveryAddress.data
            ? // @ts-expect-error TODO: fix type
              (group.deliveryAddress.data.city as City)
            : null,
        }
      : {
          addressId: null,
          city: null,
        };

    if (selectedDeliveryMethod) {
      const deliveryGroup: DeliveryGroup = {
        id: group.id,
        deliveryMethods,
        selectedDeliveryMethod,
        address,
      };

      formData[group.id] = deliveryGroup;
    }
  }

  return Object.keys(formData).length > 0 ? formData : null;
}
