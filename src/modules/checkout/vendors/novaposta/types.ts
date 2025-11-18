/**
 * Vendor-local state types for Nova Poshta.
 * These types are intentionally defined within the vendor module so that
 * the checkout module remains agnostic of shipping/payment state details.
 */

/**
 * City type returned by Nova Poshta settlements API.
 * Updated to match the new @shopana/novaposhta-api-client format (camelCase).
 */
export interface City {
  addressDeliveryAllowed?: boolean;
  area: string;
  deliveryCity: string;
  mainDescription: string;
  parentRegionCode?: string;
  parentRegionTypes?: string;
  present?: string;
  ref: string;
  region: string;
  regionTypes?: string;
  regionTypesCode?: string;
  settlementTypeCode: string;
  streetsAvailability?: boolean;
  warehouses: number;
}

/**
 * Street type returned by Nova Poshta streets API.
 */
export interface Street {
  present: string;
  settlementRef: string;
  settlementStreetDescription: string;
  settlementStreetDescriptionRu?: string;
  settlementStreetRef: string;
  streetsType: string;
  streetsTypeDescription: string;
}

/**
 * Minimal Warehouse shape used by Nova Poshta UI components.
 * Includes fields referenced in UI; extra fields are allowed via index signature.
 */
export interface Warehouse {
  id: string;
  Number: string;
  ShortAddress: string;
  Schedule: string;
  CityRef: string;
  CityName: string;
  RegionCity: string;
  [key: string]: unknown;
}
