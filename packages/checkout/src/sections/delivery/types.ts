import type { Checkout } from '#checkout/types/entity';
import type { ProviderDeliveryAddress } from '#checkout/vendors/types';

export interface DeliveryMethod {
  handle: string;
  code: string;
  title: string;
  description?: string | null;
  provider: string;
  /** Locally persisted private input sent back through customerInput. */
  data: unknown;
  /** Module-owned display state persisted with the input. */
  view?: unknown;
  /** False while the stored input still has to be saved through the API. */
  synced?: boolean;
  /** JSON Schema of the customer input from the API. */
  customerInputContract: unknown;
  /** Read-only metadata returned by the provider through publicData. */
  publicData: unknown;
}

/**
 * Delivery address data
 */
export type DeliveryAddress = ProviderDeliveryAddress;

/**
 * Delivery group data
 */
export interface DeliveryGroup {
  id: string;
  deliveryMethods: DeliveryMethod[];
  selectedDeliveryMethod: DeliveryMethod | null;
  address: DeliveryAddress | null;
  /** Why the API reset the selection (status `RESET`); `null` otherwise. */
  resetReason: Checkout.SelectionResetReason | null;
  /** Option the API dropped with the reset; `null` unless the selection was reset. */
  previousOptionHandle: string | null;
}

/**
 * Form data type for the delivery section
 */
export interface DeliveryFormData {
  [key: string]: DeliveryGroup;
}

type DeliveryProviderCode = string;

export type DeliveryProviderMethodsRecord = Record<
  DeliveryProviderCode,
  DeliveryMethod[]
>;

