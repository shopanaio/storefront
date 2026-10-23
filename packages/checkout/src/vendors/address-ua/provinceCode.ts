import type { Settlement } from '#checkout/vendors/nova-poshta/types';

/**
 * ISO 3166-2:UA codes of the oblasts, without the country prefix as the storefront address
 * format lists them (B6), by the name Nova Poshta gives in `area`.
 */
const OBLASTS: Record<string, string> = {
  вінницька: '05',
  волинська: '07',
  луганська: '09',
  дніпропетровська: '12',
  донецька: '14',
  житомирська: '18',
  закарпатська: '21',
  запорізька: '23',
  'івано-франківська': '26',
  київська: '32',
  кіровоградська: '35',
  львівська: '46',
  миколаївська: '48',
  одеська: '51',
  полтавська: '53',
  рівненська: '56',
  сумська: '59',
  тернопільська: '61',
  харківська: '63',
  херсонська: '65',
  хмельницька: '68',
  черкаська: '71',
  чернівецька: '74',
  чернігівська: '77',
  'автономна республіка крим': '43',
  крим: '43',
};

/** Cities with special status have codes of their own, apart from their oblast. */
const CITIES: Record<string, string> = {
  київ: '30',
  севастополь: '40',
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[’`ʼ]/g, "'")
    .replace(/\s+(обл\.?|область)$/u, '')
    .trim();

const isCity = (settlementType: string | null | undefined) =>
  /^(м\.?|місто)$/u.test(settlementType?.trim().toLowerCase() ?? '');

/**
 * Province code (ISO 3166-2:UA without `UA-`) of a Nova Poshta settlement, or `null` when its
 * area is unknown. The city of Kyiv is `30`; a village named Kyiv keeps its oblast.
 */
export function settlementProvinceCode(
  settlement: Pick<Settlement, 'name' | 'area' | 'settlementType'>
): string | null {
  const city = CITIES[normalize(settlement.name)];
  if (city && isCity(settlement.settlementType)) {
    return city;
  }
  return settlement.area ? (OBLASTS[normalize(settlement.area)] ?? null) : null;
}
