import type { Checkout } from '@src/modules/checkout/types/entity';
import type {
  DeliveryFormData,
  DeliveryMethod,
  DeliveryAddress,
} from './types';

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
        data: method.data,
      })
    );

    const selectedDeliveryMethod: DeliveryMethod | null =
      group.selectedDeliveryMethod
        ? {
            code: group.selectedDeliveryMethod.code,
            provider: group.selectedDeliveryMethod.provider.code,
            data: group.selectedDeliveryMethod.data,
          }
        : null;

    console.log('selectedDeliveryMethod ---->', selectedDeliveryMethod);

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

    formData[group.id] = {
      id: group.id,
      deliveryMethods,
      selectedDeliveryMethod,
      address,
    };
  }

  return Object.keys(formData).length > 0 ? formData : null;
}
