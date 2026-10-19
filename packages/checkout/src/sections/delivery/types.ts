import type { model } from '@shopana/storefront-sdk';
import type { Checkout } from '#checkout/types/entity';
import type { ProviderDeliveryAddress } from '#checkout/vendors/types';

export interface DeliveryMethod {
  handle: string;
  code: string;
  title: string;
  description?: string | null;
  provider: string;
  /** Carrier code from the API; `null` for options rendered generically. */
  carrierCode: string | null;
  /** Charge of the option; known once the API accepted the selection with its input. */
  cost: model.Money;
  paymentModel: Checkout.ShippingPaymentModel;
  estimatedMinDeliveryAt: Date | null;
  estimatedMaxDeliveryAt: Date | null;
  /** Customer input of the option: the one typed and not saved yet, else the one the API saved. */
  data: unknown;
  /** Module-owned display state, kept in localStorage with the input. */
  view?: unknown;
  /** False while the input still has to be saved through the API. */
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
  /** Earlier ids of the group, newest first; input stored under them belongs to it. */
  replacesGroupIds: string[];
  /** Lines the group ships, as the API split them. */
  lines: Checkout.Line[];
  deliveryMethods: DeliveryMethod[];
  selectedDeliveryMethod: DeliveryMethod | null;
  address: DeliveryAddress | null;
  /** Why the API reset the selection (status `RESET`); `null` otherwise. */
  resetReason: Checkout.SelectionResetReason | null;
  /** Option the API dropped with the reset; `null` unless the selection was reset. */
  previousOptionHandle: string | null;
  /** Customer input the API saved for the selected (or reset) option. */
  savedInput: unknown;
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

