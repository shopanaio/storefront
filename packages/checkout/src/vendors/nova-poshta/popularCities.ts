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

/** Largest cities, offered before the customer starts typing. */
export const popularCities: Settlement[] = [
  city('e718a680-4b33-11e4-ab6d-005056801329', '8d5a980d-391c-11dd-90d9-001a92567626', 'Київ', 'Київська', 10886),
  city('e71f8842-4b33-11e4-ab6d-005056801329', 'db5c88e0-391c-11dd-90d9-001a92567626', 'Харків', 'Харківська', 2548),
  city('e71c2a15-4b33-11e4-ab6d-005056801329', 'db5c88d0-391c-11dd-90d9-001a92567626', 'Одеса', 'Одеська', 2462),
  city('e717110a-4b33-11e4-ab6d-005056801329', 'db5c88f0-391c-11dd-90d9-001a92567626', 'Дніпро', 'Дніпропетровська', 3999),
  city('e717bce9-4b33-11e4-ab6d-005056801329', 'db5c88c6-391c-11dd-90d9-001a92567626', 'Запоріжжя', 'Запорізька', 1919),
  city('e71abb60-4b33-11e4-ab6d-005056801329', 'db5c88f5-391c-11dd-90d9-001a92567626', 'Львів', 'Львівська', 3319),
];
