import { useMemo } from 'react';
import type { DeliveryFormData, DeliveryMethod } from './types';
import { contractSchema, validateCustomerInput } from '#checkout/utils/jsonSchema';
import {
  addressScope,
  readCustomerInputs,
  useCustomerInputStore,
  type CustomerInputsByHandle,
} from './customerInputStorage';

/**
 * Input of an option nothing was entered for: `{}` when its contract accepts an empty
 * object (only optional fields), so optional fields never block the order.
 */
export const initialCustomerInput = (method: DeliveryMethod): unknown =>
  contractSchema(method.customerInputContract) &&
  validateCustomerInput(method.customerInputContract, {}).length === 0
    ? {}
    : undefined;

export const withStoredInput = (
  method: DeliveryMethod,
  inputs: CustomerInputsByHandle
): DeliveryMethod => {
  const stored = inputs[method.handle];
  return stored
    ? { ...method, data: stored.input, view: stored.view, synced: stored.synced }
    : { ...method, data: initialCustomerInput(method), view: undefined };
};

/**
 * Adds the stored customer input to every option of the delivery form data. The API
 * does not return the input, so without this the section would validate (and render)
 * options with no input at all.
 */
export function mergeCustomerInputs(
  data: DeliveryFormData | null,
  groups: ReturnType<typeof useCustomerInputStore.getState>['groups']
): DeliveryFormData | null {
  if (!data) {
    return null;
  }
  return Object.fromEntries(
    Object.entries(data).map(([key, group]) => {
      const inputs = readCustomerInputs(group.id, addressScope(group.address), groups);
      return [
        key,
        {
          ...group,
          deliveryMethods: group.deliveryMethods.map((method) =>
            withStoredInput(method, inputs)
          ),
          selectedDeliveryMethod: group.selectedDeliveryMethod
            ? withStoredInput(group.selectedDeliveryMethod, inputs)
            : null,
        },
      ];
    })
  );
}

/** Delivery form data with the stored customer input; follows every store change. */
export function useDeliveryFormData(
  data: DeliveryFormData | null
): DeliveryFormData | null {
  const groups = useCustomerInputStore((state) => state.groups);
  return useMemo(() => mergeCustomerInputs(data, groups), [data, groups]);
}
