import { createClient, AddressService } from '@shopana/novaposhta-api-client';
import { createFetchHttpTransport } from '@shopana/novaposhta-transport-fetch';
import type {
  NovaPoshtaResponse,
  SearchSettlementStreetsRequest,
  SearchSettlementStreetsResponse,
  SettlementStreetAddress,
} from '@shopana/novaposhta-api-client';

// Warehouse types (missing in alpha version)
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

export interface GetWarehousesRequest {
  CityName: string;
  WarehouseId?: string;
  Limit?: string;
  Page?: string;
}

export type GetWarehousesResponse = NovaPoshtaResponse<WarehouseData[]>;

// Create Nova Poshta client
const transport = createFetchHttpTransport();

const baseClient = createClient({
  transport,
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
  // apiKey is optional for most read operations
});

// Add address service
export const client = baseClient.use(new AddressService());

// Helper function to make raw API requests (for methods not yet in alpha)
async function makeRawRequest<TResponse>(
  modelName: string,
  calledMethod: string,
  methodProperties: unknown
): Promise<TResponse> {
  const response = await transport({
    url: 'https://api.novaposhta.ua/v2.0/json/',
    body: {
      modelName,
      calledMethod,
      methodProperties,
    },
  });

  if (response.status !== 200) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const result = response.data as NovaPoshtaResponse<unknown>;
  if (!result.success) {
    throw new Error(`API error: ${result.errors?.join(', ') || 'Unknown error'}`);
  }

  return response.data as TResponse;
}

// Add missing getWarehouses method
export async function getWarehouses(
  request: GetWarehousesRequest
): Promise<GetWarehousesResponse> {
  return makeRawRequest<GetWarehousesResponse>(
    'AddressGeneral',
    'getWarehouses',
    request
  );
}

// Re-export types for convenience
export type {
  SearchSettlementStreetsRequest,
  SearchSettlementStreetsResponse,
  SettlementStreetAddress,
};
