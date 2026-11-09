/**
 * Nova Poshta types. Directory rows are read in the browser from the carrier API; customer
 * input follows the `customerInputContract` of the Nova Poshta app.
 */

/** Settlement of `searchSettlements`. */
export interface Settlement {
  /** Settlement ref; `settlementRef` of the customer input. */
  ref: string;
  /** Ref of the carrier city that serves the settlement; `cityRef` of the customer input. */
  cityRef: string;
  name: string;
  /** Full name with area and region, for example "м. Київ, Київська обл.". */
  present: string;
  area: string | null;
  region: string | null;
  settlementType: string | null;
  warehouseCount: number | null;
  addressDeliveryAllowed: boolean | null;
}

export interface ScheduleDay {
  /** English weekday name as the carrier returns it, for example "Monday". */
  day: string;
  /** Hours as the carrier returns them, for example "08:00-21:00" or "-". */
  hours: string;
}

/** Branch or postomat of `getWarehouses`. */
export interface Warehouse {
  /** Point ref; `warehouseRef` of the customer input. */
  ref: string;
  kind: 'WAREHOUSE' | 'POSTOMAT';
  number: string;
  description: string;
  shortAddress: string;
  /** Working and not denied for selection; only such points can be picked. */
  selectable: boolean;
  settlementRef: string;
  schedule: ScheduleDay[];
}

/** Street of `searchSettlementStreets`. */
export interface Street {
  /** Settlement street ref; `streetRef` of the courier customer input. */
  ref: string;
  settlementRef: string;
  name: string;
  /** Name with the street type, for example "вул. Хрещатик". */
  present: string;
  streetType: string | null;
}

/** Receiving type of a service; the `type` of the customer input. */
export type ReceivingType = 'WAREHOUSE' | 'POSTOMAT' | 'DOOR';

/**
 * Delivery services of the app; option `code` in the checkout API. A service is how the
 * customer receives the parcel; how it leaves the seller is a setting of the merchant.
 */
export type ServiceCode = 'warehouse' | 'doors' | 'postomat';

export interface PointInput {
  type: 'WAREHOUSE' | 'POSTOMAT';
  settlementRef: string;
  cityRef: string;
  warehouseRef: string;
}

export interface DoorInput {
  type: 'DOOR';
  settlementRef: string;
  cityRef: string;
  streetRef: string;
  streetName: string;
  building: string;
  apartment?: string;
  comment?: string;
}

/**
 * Courier input before a street is picked. The contract does not accept it, so it is never
 * sent; it is kept so the building, apartment and comment survive a remount of the form.
 */
export type DoorDraft = Omit<DoorInput, 'streetRef' | 'streetName'> &
  Partial<Pick<DoorInput, 'streetRef' | 'streetName'>>;

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
