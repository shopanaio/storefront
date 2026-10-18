/**
 * Nova Poshta types. Directory rows come from the storefront queries of the Nova Poshta
 * app; customer input follows the app's `customerInputContract`.
 */

import type {
  StorefrontNovaPoshtaSettlementFragment,
  StorefrontNovaPoshtaStreetFragment,
  StorefrontNovaPoshtaWarehouseFragment,
} from '#checkout/graphql/operations';

export type Settlement = StorefrontNovaPoshtaSettlementFragment;
export type Warehouse = StorefrontNovaPoshtaWarehouseFragment;
export type Street = StorefrontNovaPoshtaStreetFragment;

/** Receiving type of a service; the `type` of the customer input. */
export type ReceivingType = 'WAREHOUSE' | 'POSTOMAT' | 'DOOR';

/** Delivery services of the app; option `code` in the checkout API. */
export type ServiceCode =
  | 'warehouse-warehouse'
  | 'warehouse-doors'
  | 'doors-warehouse'
  | 'doors-doors'
  | 'postomat';

export interface PointInput {
  type: 'WAREHOUSE' | 'POSTOMAT';
  settlementRef: string;
  warehouseRef: string;
}

export interface DoorInput {
  type: 'DOOR';
  settlementRef: string;
  streetRef: string;
  streetName: string;
  building: string;
  apartment?: string;
  comment?: string;
}

export type CustomerInput = PointInput | DoorInput;

/** Display state of a picked branch or postomat, kept next to the input. */
export interface PointView {
  number: string;
  shortAddress: string;
  schedule: Warehouse['schedule'];
}

/** Display state of a picked street. */
export interface DoorView {
  streetPresent: string;
}
