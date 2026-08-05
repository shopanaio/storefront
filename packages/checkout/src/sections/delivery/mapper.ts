import type { Checkout } from '#checkout/types/entity';
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
        handle: method.handle,
        code: method.code,
        title: method.title,
        description: method.description,
        provider: method.provider.code,
        data: undefined,
        publicData: method.publicData,
      })
    );

    const selectedDeliveryMethod: DeliveryMethod | null =
      group.selectedDeliveryMethod
        ? {
            handle: group.selectedDeliveryMethod.handle,
            code: group.selectedDeliveryMethod.code,
            title: group.selectedDeliveryMethod.title,
            description: group.selectedDeliveryMethod.description,
            provider: group.selectedDeliveryMethod.provider.code,
            data: undefined,
            publicData: group.selectedDeliveryMethod.publicData,
          }
        : null;

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
