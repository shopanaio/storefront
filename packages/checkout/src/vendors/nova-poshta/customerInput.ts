import type {
  CustomerInput,
  DoorDraft,
  DoorInput,
  PointInput,
  ReceivingType,
  ServiceCode,
} from './types';

/** Receiving type of each service: the `type` of its customer input. */
export const SERVICE_RECEIVING_TYPE: Record<ServiceCode, ReceivingType> = {
  warehouse: 'WAREHOUSE',
  doors: 'DOOR',
  postomat: 'POSTOMAT',
};

export function pointInput(
  type: PointInput['type'],
  settlementRef: string,
  warehouseRef: string
): PointInput {
  return { type, settlementRef, warehouseRef };
}

/**
 * Courier input. `streetName` is the street `name` from the directory: the carrier finds
 * a settlement street only by name, so the backend checks `streetRef` with it. Empty
 * optional fields are left out (`additionalProperties: false`, no empty strings).
 */
export function doorInput(fields: {
  settlementRef: string;
  streetRef: string;
  streetName: string;
  building: string;
  apartment?: string;
  comment?: string;
}): DoorInput {
  const apartment = fields.apartment?.trim();
  const comment = fields.comment?.trim();
  return {
    type: 'DOOR',
    settlementRef: fields.settlementRef,
    streetRef: fields.streetRef,
    streetName: fields.streetName,
    building: fields.building.trim(),
    ...(apartment ? { apartment } : {}),
    ...(comment ? { comment } : {}),
  };
}

/** Courier fields typed before a street is picked, kept as the draft of the form. */
export function doorDraft(fields: {
  settlementRef: string;
  building: string;
  apartment: string;
  comment: string;
}): DoorDraft {
  return {
    type: 'DOOR',
    settlementRef: fields.settlementRef,
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
    ? (input as T extends 'DOOR' ? DoorDraft : Extract<CustomerInput, { type: T }>)
    : null;
}
