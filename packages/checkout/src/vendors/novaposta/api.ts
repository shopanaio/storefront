import { createClient, AddressService } from '@shopana/novaposhta-api-client';
import { createFetchHttpTransport } from '@shopana/novaposhta-transport-fetch';

// Create Nova Poshta client
const transport = createFetchHttpTransport();

const baseClient = createClient({
  transport,
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
  // apiKey is optional for most read operations
});

// Add address service
export const client = baseClient.use(new AddressService());

// Re-export types from the library
export type {
  SearchSettlementStreetsRequest,
  SearchSettlementStreetsResponse,
  SettlementStreetAddress,
  GetWarehousesRequest,
  GetWarehousesResponse,
  WarehouseData,
} from '@shopana/novaposhta-api-client';
