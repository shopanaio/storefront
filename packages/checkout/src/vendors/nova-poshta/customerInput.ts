import type { SettlementHint } from './address';
import type {
  CustomerInput,
  DoorDraft,
  DoorInput,
  PointInput,
  ReceivingType,
  ServiceCode,
} from './types';

/**
 * Receiving type of each service: the `type` of its customer input. The order is the order the
 * options are shown in: branch, postomat, courier.
 */
export const SERVICE_RECEIVING_TYPE: Record<ServiceCode, ReceivingType> = {
  warehouse: 'WAREHOUSE',
  postomat: 'POSTOMAT',
  doors: 'DOOR',
};

/**
 * Branch or postomat input. Every ref comes from the carrier directory as the browser read it;
 * the backend takes them as they are.
 */
export function pointInput(
  type: PointInput['type'],
  settlement: SettlementHint,
  warehouseRef: string
): PointInput {
  return {
    type,
    settlementRef: settlement.settlementRef,
    cityRef: settlement.cityRef,
    warehouseRef,
  };
}

/**
 * Courier input. `streetRef` and `streetName` are the street `ref` and `name` from the
 * directory. Empty optional fields are left out (`additionalProperties: false`, no empty
 * strings).
 */
export function doorInput(
  fields: SettlementHint & {
    streetRef: string;
    streetName: string;
    building: string;
    apartment?: string;
    comment?: string;
  }
): DoorInput {
  const apartment = fields.apartment?.trim();
  const comment = fields.comment?.trim();
  return {
    type: 'DOOR',
    settlementRef: fields.settlementRef,
    cityRef: fields.cityRef,
    streetRef: fields.streetRef,
    streetName: fields.streetName,
    building: fields.building.trim(),
    ...(apartment ? { apartment } : {}),
    ...(comment ? { comment } : {}),
  };
}

/** Courier fields typed before a street is picked, kept as the draft of the form. */
export function doorDraft(
  fields: SettlementHint & {
    building: string;
    apartment: string;
    comment: string;
  }
): DoorDraft {
  return {
    type: 'DOOR',
    settlementRef: fields.settlementRef,
    cityRef: fields.cityRef,
    building: fields.building,
    ...(fields.apartment ? { apartment: fields.apartment } : {}),
    ...(fields.comment ? { comment: fields.comment } : {}),
  };
}

/**
 * Stored input of the given type for the given settlement, or `null`. A courier input may
 * be a draft without a street.
 */
export function readInput<T extends CustomerInput['type']>(
  data: unknown,
  type: T,
  settlementRef: string | null
): (T extends 'DOOR' ? DoorDraft : Extract<CustomerInput, { type: T }>) | null {
  if (!data || typeof data !== 'object') {
    return null;
  }
  const input = data as CustomerInput;
  return input.type === type && input.settlementRef === settlementRef
    ? (input as T extends 'DOOR'
        ? DoorDraft
        : Extract<CustomerInput, { type: T }>)
    : null;
}
