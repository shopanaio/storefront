import type { Settlement } from './types';

const city = (
  ref: string,
  cityRef: string,
  name: string,
  area: string,
  warehouseCount: number
): Settlement => ({
  __typename: 'NovaPoshtaSettlement',
  ref,
  cityRef,
  name,
  present: `м. ${name}, ${area} обл.`,
  area,
  region: null,
  settlementType: 'місто',
  warehouseCount,
  addressDeliveryAllowed: true,
});

/**
 * Cities offered before the customer starts typing, most populous first. A city without a ref
 * (empty) is not known to the carrier here yet: picking it searches for it by name. The list is
 * to move to settlement codes.
 */
export const popularCities: Settlement[] = [
  city('e718a680-4b33-11e4-ab6d-005056801329', '8d5a980d-391c-11dd-90d9-001a92567626', 'Київ', 'Київська', 10886),
  city('e71f8842-4b33-11e4-ab6d-005056801329', 'db5c88e0-391c-11dd-90d9-001a92567626', 'Харків', 'Харківська', 2548),
  city('e71c2a15-4b33-11e4-ab6d-005056801329', 'db5c88d0-391c-11dd-90d9-001a92567626', 'Одеса', 'Одеська', 2462),
  city('e717110a-4b33-11e4-ab6d-005056801329', 'db5c88f0-391c-11dd-90d9-001a92567626', 'Дніпро', 'Дніпропетровська', 3999),
  city('e71abb60-4b33-11e4-ab6d-005056801329', 'db5c88f5-391c-11dd-90d9-001a92567626', 'Львів', 'Львівська', 3319),
  city('', '', 'Кривий Ріг', 'Дніпропетровська', 0),
  city('', '', 'Миколаїв', 'Миколаївська', 0),
  city('', '', 'Івано-Франківськ', 'Івано-Франківська', 0),
];
