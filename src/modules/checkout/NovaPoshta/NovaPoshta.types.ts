import {
  String36,
  String50,
} from "./NovaPoshtaSupporting.types"
import { NovaPoshtaErrorCode } from "./NovaPoshtaErrorCode";

export interface NovaPoshtaResponse<T> {
  success: boolean;
  data: T;
  errors: string[];
  warnings: string[];
  info: string[];
  messageCodes: string[];
  errorCodes: NovaPoshtaErrorCode[];
  warningCodes: string[];
  infoCodes: string[];
}

export interface searchSettlementsProperties {
  CityName: String36;
  Page: String36;
  Limit: String36;
}

interface searchSettlementsResponseData {
  TotalCount: String36;
  Addresses: [];
  Warehouses: String36;
  MainDescription: String50;
  Area: String50;
  Region: String50;
  SettlementTypeCode: String50;
  Ref: String50;
  DeliveryCity: String50;
}

export type searchSettlementsResponse = NovaPoshtaResponse<searchSettlementsResponseData[]>;

export interface searchSettlementStreetsProperties {
  StreetName: String36;
  SettlementRef: String36;
  Limit?: String36;
}

interface addressesLocation {
  lat: "50.44806099962443";
  lon: "30.52225599065423";
}

interface StreetsDataAddressesItem {
  SettlementRef: String50;
  SettlementStreetRef: String50;
  SettlementStreetDescription: String50;
  Present: String50;
  StreetsType: String50;
  StreetsTypeDescription: String50;
  Location: addressesLocation;
  SettlementStreetDescriptionRu: String50;
}

interface searchSettlementStreetsData {
  TotalCount: String36;
  Addresses: StreetsDataAddressesItem[];
}

export type searchSettlementStreetsResponse = NovaPoshtaResponse<searchSettlementStreetsData[]>;

export interface getWarehousesProperties {
  CityName: string;
  WarehouseId?: string;
  Limit?: string;
  Page?: string;
}

export interface WarehouseData {
  Ref: string;
  Number: string;
  CityRef: string;
  CityDescription: string;
  Address: string;
  Schedule: string;
  TypeOfWarehouse: string;
  PostFinance: string;
  BicycleParking: string;
  PaymentAccess: string;
  POSTerminal: string;
  InternationalShipping: string;
  SelfServiceWorkplacesCount: string;
  TotalMaxWeightAllowed: string;
  PlaceMaxWeightAllowed: string;
  Reception: string;
  Delivery: string;
  Rejection: string;
  RegionCity: string;
  ShortAddress: string;
}

export interface getWarehousesResponse {
  success: boolean;
  data: WarehouseData[];
  errors: string[];
  warnings: string[];
  info: string[];
}