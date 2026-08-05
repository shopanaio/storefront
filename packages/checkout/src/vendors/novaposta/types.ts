/**
 * Vendor-local state types for Nova Poshta.
 * These types are intentionally defined within the vendor module so that
 * the checkout module remains agnostic of shipping/payment state details.
 */

import type { SearchSettlementAddress, SettlementStreetAddress } from '@shopana/novaposhta-api-client';

export type City = SearchSettlementAddress;
export type Street = SettlementStreetAddress;

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
