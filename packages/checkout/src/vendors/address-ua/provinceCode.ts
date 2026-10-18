import type { Settlement } from '#checkout/vendors/nova-poshta/types';

/** ISO 3166-2:UA codes of the oblasts by the name Nova Poshta gives in `area`. */
const OBLASTS: Record<string, string> = {
  вінницька: 'UA-05',
  волинська: 'UA-07',
  луганська: 'UA-09',
  дніпропетровська: 'UA-12',
  донецька: 'UA-14',
  житомирська: 'UA-18',
  закарпатська: 'UA-21',
  запорізька: 'UA-23',
  'івано-франківська': 'UA-26',
  київська: 'UA-32',
  кіровоградська: 'UA-35',
  львівська: 'UA-46',
  миколаївська: 'UA-48',
  одеська: 'UA-51',
  полтавська: 'UA-53',
  рівненська: 'UA-56',
  сумська: 'UA-59',
  тернопільська: 'UA-61',
  харківська: 'UA-63',
  херсонська: 'UA-65',
  хмельницька: 'UA-68',
  черкаська: 'UA-71',
  чернівецька: 'UA-74',
  чернігівська: 'UA-77',
  'автономна республіка крим': 'UA-43',
  крим: 'UA-43',
};

/** Cities with special status have codes of their own, apart from their oblast. */
const CITIES: Record<string, string> = {
  київ: 'UA-30',
  севастополь: 'UA-40',
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
 * Province code (ISO 3166-2:UA) of a Nova Poshta settlement, or `null` when its area is
 * unknown. The city of Kyiv is `UA-30`; a village named Kyiv keeps its oblast.
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
