import { useMemo } from 'react';
import type { DeliveryFormData, DeliveryGroup, DeliveryMethod } from './types';
import { contractSchema, validateCustomerInput } from '#checkout/utils/jsonSchema';
import {
  addressScope,
  readCustomerInputs,
  sameInput,
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

/** Option of the group the API returned the saved input for: the selected or the reset one. */
const savedHandleOf = (group: DeliveryGroup): string | null =>
  group.selectedDeliveryMethod?.handle ?? group.previousOptionHandle;

/**
 * The option with its customer input. A draft the API has not accepted yet wins over the saved
 * input (BR-q7dr). A saved draft is used while the API says nothing else about the option, so
 * its display state stays; once the API returns another input for it (saved in another tab),
 * that input is shown.
 */
export const withCustomerInput = (
  method: DeliveryMethod,
  drafts: CustomerInputsByHandle,
  group: DeliveryGroup
): DeliveryMethod => {
  const draft = drafts[method.handle];
  const saved =
    savedHandleOf(group) === method.handle ? (group.savedInput ?? null) : undefined;
  if (draft && (!draft.synced || saved === undefined || sameInput(draft.input, saved))) {
    return { ...method, data: draft.input, view: draft.view, synced: draft.synced };
  }
  if (saved !== undefined && saved !== null) {
    return { ...method, data: saved, view: undefined, synced: true };
  }
  return { ...method, data: initialCustomerInput(method), view: undefined };
};

/**
 * Adds the customer input to every option of the delivery form data: the input the API saved
 * for the selected option, and the inputs stored in this browser.
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
      const drafts = readCustomerInputs(group, addressScope(group.address), groups);
      return [
        key,
        {
          ...group,
          deliveryMethods: group.deliveryMethods.map((method) =>
            withCustomerInput(method, drafts, group)
          ),
          selectedDeliveryMethod: group.selectedDeliveryMethod
            ? withCustomerInput(group.selectedDeliveryMethod, drafts, group)
            : null,
        },
      ];
    })
  );
}

/** Delivery form data with the customer input; follows every store change. */
export function useDeliveryFormData(
  data: DeliveryFormData | null
): DeliveryFormData | null {
  const groups = useCustomerInputStore((state) => state.groups);
  return useMemo(() => mergeCustomerInputs(data, groups), [data, groups]);
}
