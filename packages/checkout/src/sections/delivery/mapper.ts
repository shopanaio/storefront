import type { Checkout } from '#checkout/types/entity';
import type {
  DeliveryFormData,
  DeliveryMethod,
  DeliveryAddress,
} from './types';

const toDeliveryMethod = (method: Checkout.DeliveryMethod): DeliveryMethod => ({
  handle: method.handle,
  code: method.code,
  title: method.title,
  description: method.description,
  provider: method.provider.code,
  carrierCode: method.carrierCode,
  estimatedMinDeliveryAt: method.estimatedMinDeliveryAt,
  estimatedMaxDeliveryAt: method.estimatedMaxDeliveryAt,
  data: undefined,
  customerInputContract: method.customerInputContract,
  publicData: method.publicData,
});

/** Neutral view of a group address; carrier modules read their own hints from `data`. */
export const toDeliveryAddress = (
  address: Checkout.DeliveryAddress | null
): DeliveryAddress | null =>
  address
    ? {
        addressId: address.id,
        countryCode: address.countryCode,
        city: address.city,
        address1: address.address1,
        address2: address.address2,
        postalCode: address.postalCode,
        provinceCode: address.provinceCode,
        data: address.data,
      }
    : null;

/**
 * Maps Checkout.Checkout entity to DeliveryFormData
 * Extracts delivery groups, their selected delivery methods, and address data. A selection
 * the API reset (carrier refused the input, option expired) keeps its reason and the option
 * it dropped, so the section can tell the customer and reopen that option. The customer input
 * the API saved for that option comes along (`savedInput`); `withCustomerInputs` puts it on
 * the option.
 */
export function mapCheckoutToDeliveryFormData(
  checkout: Checkout.Checkout | null
): DeliveryFormData | null {
  if (!checkout) {
    return null;
  }

  const formData: DeliveryFormData = {};

  for (const group of checkout.deliveryGroups) {
    const {
      option: selectedOption,
      status,
      resetReason,
      previousOptionHandle,
      customerInput,
    } = group.selection;
    const reset = status === 'RESET';

    formData[group.id] = {
      id: group.id,
      replacesGroupIds: group.replacesGroupIds,
      lines: group.checkoutLines,
      deliveryMethods: group.deliveryMethods.map(toDeliveryMethod),
      selectedDeliveryMethod: selectedOption
        ? toDeliveryMethod(selectedOption)
        : null,
      address: toDeliveryAddress(group.deliveryAddress),
      resetReason: reset ? resetReason : null,
      previousOptionHandle: reset ? previousOptionHandle : null,
      savedInput: customerInput ?? null,
      shipping: group.shipping,
    };
  }

  return Object.keys(formData).length > 0 ? formData : null;
}
