export interface DeliveryMethod {
  code: string;
  provider: string;
  data: unknown;
}
/**
 * Delivery group data
 */
export interface DeliveryGroup {
  id: string;
  deliveryMethods: DeliveryMethod[];
  selectedDeliveryMethod: DeliveryMethod;
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
    code: DeliveryMethodCode;
    data: DeliveryMethodData;
    provider: string;
  }>
>;

export type DeliveryGroupRecord = {
  id: string;
  selectedDeliveryMethod: DeliveryMethod | null;
  providerMethodsRecord: DeliveryProviderMethodsRecord;
};
