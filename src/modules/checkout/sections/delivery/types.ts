export interface DeliveryMethod {
  handle: string;
  code: string;
  title: string;
  description?: string | null;
  provider: string;
  /** Locally persisted private input sent back through customerInput. */
  data: unknown;
  /** Read-only metadata returned by the provider through publicData. */
  publicData: unknown;
}

/**
 * Delivery address data
 */
export interface DeliveryAddress {
  addressId: string | null;
  city: unknown;
}

/**
 * Delivery group data
 */
export interface DeliveryGroup {
  id: string;
  deliveryMethods: DeliveryMethod[];
  selectedDeliveryMethod: DeliveryMethod | null;
  address: DeliveryAddress;
}

/**
 * Form data type for the delivery section
 */
export interface DeliveryFormData {
  [key: string]: DeliveryGroup;
}

type DeliveryProviderCode = string;
type DeliveryMethodCode = string;
type DeliveryMethodData = unknown;

export type DeliveryProviderMethodsRecord = Record<
  DeliveryProviderCode,
  Array<{
    handle: string;
    code: DeliveryMethodCode;
    data: DeliveryMethodData;
    publicData: unknown;
    title: string;
    description?: string | null;
    provider: string;
  }>
>;

export type DeliveryGroupRecord = {
  id: string;
  selectedDeliveryMethod: DeliveryMethod | null;
  providerMethodsRecord: DeliveryProviderMethodsRecord;
};
