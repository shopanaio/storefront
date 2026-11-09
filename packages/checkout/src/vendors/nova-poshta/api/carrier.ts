import {
  AddressService,
  createClient,
  type SearchSettlementAddress,
  type WarehouseData,
} from '@shopana/novaposhta-api-client';
import { createFetchHttpTransport } from '@shopana/novaposhta-transport-fetch';
import type { Settlement, Street, Warehouse } from '../types';

/**
 * Nova Poshta directory read in the browser straight from the carrier API, without an API key:
 * `searchSettlements`, `getWarehouses` and `searchSettlementStreets`. Rows are mapped the way
 * the Nova Poshta app maps them, so every ref is the value the customer input expects.
 */

const BASE_URL = 'https://api.novaposhta.ua/v2.0/json/';
/** An answer that takes longer counts as the carrier not answering. */
const TIMEOUT_MS = 10_000;
/** The carrier's "too many requests" code. */
const RATE_LIMITED = '20000401501';

/**
 * Directory failure the UI tells apart: `unavailable` — the carrier did not answer (worth
 * retrying); `invalid` — the carrier rejected the request; `failed` — anything else.
 */
export type DirectoryError = 'unavailable' | 'invalid' | 'failed';

export class DirectoryFailure extends Error {
  constructor(readonly kind: DirectoryError) {
    super(`Nova Poshta directory: ${kind}`);
  }
}

export function directoryError(error: unknown): DirectoryError | null {
  if (!error) {
    return null;
  }
  return error instanceof DirectoryFailure ? error.kind : 'failed';
}

/** One page of a carrier list. */
export interface DirectoryPage<T> {
  items: T[];
  page: number;
  hasNextPage: boolean;
}

export interface WarehousesRequest {
  /** A single point by its ref. */
  ref?: string;
  settlementRef?: string;
  /** Text matched against the point's number and address. */
  query?: string;
  page: number;
  limit: number;
}

/** The directory the checkout reads; stories and tests give their own. */
export interface NovaPoshtaDirectory {
  settlements(request: {
    query: string;
    page: number;
    limit: number;
  }): Promise<DirectoryPage<Settlement>>;
  warehouses(request: WarehousesRequest): Promise<DirectoryPage<Warehouse>>;
  /** The carrier returns one list of up to `limit` streets and has no pages. */
  streets(request: {
    settlementRef: string;
    query: string;
    limit: number;
  }): Promise<Street[]>;
}

/** Fields the carrier returns beyond the typed ones of the client. */
type SettlementRow = SearchSettlementAddress & {
  Present?: string;
  AddressDeliveryAllowed?: boolean;
};

interface Envelope<T> {
  success: boolean;
  data: T;
  errorCodes?: readonly (string | number)[];
  info?: unknown;
}

function withTimeout(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
}

/** Rows of a successful answer; any other answer is a `DirectoryFailure`. */
async function read<T>(request: () => Promise<Envelope<T>>) {
  let response: Envelope<T>;
  try {
    response = await request();
  } catch {
    // No answer, a timeout or a body that is not the carrier's JSON.
    throw new DirectoryFailure('unavailable');
  }
  if (!response || typeof response !== 'object') {
    throw new DirectoryFailure('failed');
  }
  if (!response.success) {
    const codes = (response.errorCodes ?? []).map(String);
    throw new DirectoryFailure(
      codes.includes(RATE_LIMITED) ? 'unavailable' : 'invalid'
    );
  }
  if (!Array.isArray(response.data)) {
    throw new DirectoryFailure('failed');
  }
  return response;
}

/** Total of a paged list as the carrier reports it in `info.totalCount`. */
function totalCountOf(info: unknown): number | null {
  const value = (info as { totalCount?: unknown } | null | undefined)
    ?.totalCount;
  const count = Number(value);
  return value !== undefined && Number.isInteger(count) && count >= 0
    ? count
    : null;
}

function hasNextPage(
  totalCount: number | null,
  page: number,
  limit: number,
  received: number
) {
  return totalCount === null ? received === limit : page * limit < totalCount;
}

/** Postomat or branch, by the carrier's category and postomat type. */
function pointKind(row: WarehouseData): Warehouse['kind'] {
  return row.CategoryOfWarehouse?.toLowerCase() === 'postomat' ||
    (row.PostMachineType !== undefined &&
      row.PostMachineType !== 'None' &&
      row.PostMachineType !== '')
    ? 'POSTOMAT'
    : 'WAREHOUSE';
}

const settlementOf = (row: SettlementRow): Settlement => ({
  ref: row.Ref,
  cityRef: row.DeliveryCity,
  name: row.MainDescription,
  present: row.Present || row.MainDescription,
  area: row.Area || null,
  region: row.Region || null,
  settlementType: row.SettlementTypeCode || null,
  warehouseCount:
    row.Warehouses === undefined || row.Warehouses === null
      ? null
      : Number(row.Warehouses),
  addressDeliveryAllowed: row.AddressDeliveryAllowed ?? null,
});

const warehouseOf = (row: WarehouseData): Warehouse => ({
  ref: row.Ref,
  kind: pointKind(row),
  number: row.Number,
  description: row.Description,
  shortAddress: row.ShortAddress,
  selectable: row.WarehouseStatus === 'Working' && row.DenyToSelect !== '1',
  settlementRef: row.SettlementRef,
  schedule: Object.entries(row.Schedule ?? {}).map(([day, hours]) => ({
    day,
    hours,
  })),
});

/** The directory of the carrier API. */
export function createCarrierDirectory(): NovaPoshtaDirectory {
  const { address } = createClient({
    transport: createFetchHttpTransport({ fetchImpl: withTimeout }),
    baseUrl: BASE_URL,
    rateLimitRetry: false,
  }).use(new AddressService());

  return {
    async settlements({ query, page, limit }) {
      const { data } = await read(() =>
        address.searchSettlements({ CityName: query, Page: page, Limit: limit })
      );
      const result = data[0];
      const rows = (result?.Addresses ?? []) as SettlementRow[];
      return {
        items: rows.map(settlementOf),
        page,
        hasNextPage: hasNextPage(
          result ? Number(result.TotalCount) : 0,
          page,
          limit,
          rows.length
        ),
      };
    },

    async warehouses({ ref, settlementRef, query, page, limit }) {
      const { data, info } = await read(() =>
        address.getWarehouses({
          ...(ref ? { Ref: ref } : {}),
          ...(settlementRef ? { SettlementRef: settlementRef } : {}),
          ...(query ? { FindByString: query } : {}),
          Page: page,
          Limit: limit,
        })
      );
      return {
        items: data.map(warehouseOf),
        page,
        hasNextPage: hasNextPage(totalCountOf(info), page, limit, data.length),
      };
    },

    async streets({ settlementRef, query, limit }) {
      const { data } = await read(() =>
        address.searchSettlementStreets({
          SettlementRef: settlementRef,
          StreetName: query,
          Limit: limit,
        })
      );
      return (data[0]?.Addresses ?? []).map((row) => ({
        ref: row.SettlementStreetRef,
        settlementRef: row.SettlementRef,
        name: row.SettlementStreetDescription,
        present: row.Present,
        streetType: row.StreetsTypeDescription || null,
      }));
    },
  };
}
