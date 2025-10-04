/**
 * Vendor-local state types for Nova Poshta.
 * These types are intentionally defined within the vendor module so that
 * the checkout module remains agnostic of shipping/payment state details.
 */

/**
 * City type returned by Nova Poshta settlements API.
 */
export interface City {
  AddressDeliveryAllowed: boolean;
  Area: string;
  DeliveryCity: string;
  MainDescription: string;
  ParentRegionCode: string;
  ParentRegionTypes: string;
  Present: string;
  Ref: string;
  Region: string;
  RegionTypes: string;
  RegionTypesCode: string;
  SettlementTypeCode: string;
  StreetsAvailability: boolean;
  Warehouses: number;
}

/**
 * Street type returned by Nova Poshta streets API.
 */
export interface Street {
  Present: string;
  SettlementRef: string;
  SettlementStreetDescription: string;
  SettlementStreetDescriptionRu: string;
  SettlementStreetRef: string;
  StreetsType: string;
  StreetsTypeDescription: string;
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
