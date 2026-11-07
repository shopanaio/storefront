/**
 * Classes of the fields of a static page's data, by how fast their value changes and whom it
 * belongs to. Every class is a table of fields by type (`*` is any type) and one mechanism over
 * both formats of an Apollo state (a normalized cache, or the whole responses of the server's
 * queries): whether a field is of the class, the state without the class, the fields of the
 * class a state has.
 *
 * - Volatile fields (`VOLATILE_FIELDS`) never reach the HTML or `__static/data`: stock counts and
 *   promotions change without events, the browser asks for them after hydration with a light
 *   query (`modules/volatile`).
 * - Correctable fields (`CORRECTABLE_FIELDS`) stay in the HTML with their last known value; the
 *   same light answer corrects them in the cache.
 * - Viewer fields (`VIEWER_FIELDS`, `viewer.ts`) carry the guest's value; the buyer's comes from
 *   their own light query.
 * - Everything else is static: it changes only with an event, and a render follows.
 */

/** Fields by type; `*` is any type. */
export type FieldTable = Readonly<Record<string, readonly string[]>>;

/** Fields that change without events: out of every static page and its data. */
export const VOLATILE_FIELDS: FieldTable = {
  ProductVariant: ['quantityAvailable', 'promotions'],
  Query: ['storefrontPromotions'],
};

/**
 * Fields a static page carries with their last known value, corrected after hydration: the
 * page shows them at once (JSON-LD, a browser without JS), the light answer fixes the rest.
 */
export const CORRECTABLE_FIELDS: FieldTable = {
  ProductVariant: [
    'availableForSale',
    'currentlyNotInStock',
    'price',
    'compareAtPrice',
  ],
  Product: ['availableForSale'],
};

/** The field name of a normalized field key: arguments come after `(` or `:`. */
export function fieldName(key: string): string {
  return key.replace(/[({:].*$/, '');
}

/** Whether a field of an object of `typename` is in `table`. */
export function isTableField(
  table: FieldTable,
  typename: string | undefined,
  field: string
): boolean {
  const name = fieldName(field);
  return Boolean(
    table['*']?.includes(name) || (typename && table[typename]?.includes(name))
  );
}

type StateRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is StateRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const typenameOf = (value: StateRecord, fallback?: string) =>
  typeof value.__typename === 'string' ? value.__typename : fallback;

/** The keys of the records a reference names, at any depth of a value. */
function referencesOf(value: unknown, into: string[]): void {
  if (Array.isArray(value)) {
    for (const item of value) referencesOf(item, into);
    return;
  }
  if (!isRecord(value)) return;
  if (typeof value.__ref === 'string') {
    into.push(value.__ref);
    return;
  }
  for (const field of Object.values(value)) referencesOf(field, into);
}

/** Root records of a normalized cache: everything else lives while they reach it. */
const ROOT_RECORDS = ['ROOT_QUERY', 'ROOT_MUTATION', 'ROOT_SUBSCRIPTION'];

/** The records of a normalized cache its roots reach. */
function reachable(cache: Readonly<Record<string, unknown>>): Set<string> {
  const seen = new Set<string>();
  const stack = ROOT_RECORDS.filter((key) => key in cache);
  while (stack.length > 0) {
    const key = stack.pop()!;
    if (seen.has(key)) continue;
    seen.add(key);
    const references: string[] = [];
    referencesOf(cache[key], references);
    for (const reference of references) {
      if (!seen.has(reference) && reference in cache) stack.push(reference);
    }
  }
  return seen;
}

/** A copy of `value` without the fields of `table`, at any depth. */
function withoutFields(
  value: unknown,
  table: FieldTable,
  typename?: string
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => withoutFields(item, table));
  }
  if (!isRecord(value)) return value;
  const own = typenameOf(value, typename);
  const result: StateRecord = {};
  for (const [key, field] of Object.entries(value)) {
    if (!isTableField(table, own, key)) {
      result[key] = withoutFields(field, table);
    }
  }
  return result;
}

/** A whole response of the server's queries: its data under `d`. */
interface ResultLike {
  d: unknown;
}

const isNormalized = (state: unknown): state is StateRecord =>
  isRecord(state) && !Array.isArray(state);

/**
 * `state` without the fields of `table`, in its own format. The root of a whole response is a
 * `Query`. A record of a normalized cache that only the fields taken out reached goes with
 * them: a promotion of no other field is not in the page any more.
 */
export function stripFields<TState>(state: TState, table: FieldTable): TState {
  if (Array.isArray(state)) {
    return state.map((result: ResultLike) => ({
      ...result,
      d: withoutFields(result.d, table, 'Query'),
    })) as TState;
  }
  if (!isNormalized(state)) return state;
  const stripped: StateRecord = {};
  for (const [key, record] of Object.entries(state)) {
    stripped[key] = withoutFields(
      record,
      table,
      key === 'ROOT_QUERY' ? 'Query' : undefined
    );
  }
  const before = reachable(state);
  const after = reachable(stripped);
  for (const key of before) {
    if (!after.has(key)) delete stripped[key];
  }
  return stripped as TState;
}

/**
 * The fields of `table` a state has, as `Typename.field`, sorted: what a page asked for that
 * it must not have.
 */
export function findFields(state: unknown, table: FieldTable): string[] {
  const found = new Set<string>();
  const seen = new Set<object>();
  const visit = (value: unknown, typename?: string) => {
    if (!value || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    const record = value as StateRecord;
    const own = typenameOf(record, typename);
    for (const [key, field] of Object.entries(record)) {
      if (isTableField(table, own, key)) {
        found.add(`${own ?? '*'}.${fieldName(key)}`);
      }
      visit(field);
    }
  };
  if (Array.isArray(state)) {
    for (const result of state as ResultLike[]) visit(result.d, 'Query');
  } else if (isNormalized(state)) {
    for (const [key, record] of Object.entries(state)) {
      visit(record, key === 'ROOT_QUERY' ? 'Query' : undefined);
    }
  }
  return [...found].sort();
}

/** Whether a value shows a field of `table`, at any depth. */
export function showsFields(
  value: unknown,
  table: FieldTable,
  seen = new Set<object>()
): boolean {
  if (!value || typeof value !== 'object' || seen.has(value)) return false;
  seen.add(value);
  if (Array.isArray(value)) {
    return value.some((item) => showsFields(item, table, seen));
  }
  const record = value as StateRecord;
  const typename = typenameOf(record);
  return Object.entries(record).some(
    ([key, field]) =>
      isTableField(table, typename, key) || showsFields(field, table, seen)
  );
}

/** The state of a static page without its volatile fields: what the builder writes. */
export function stripVolatileFields<TState>(state: TState): TState {
  return stripFields(state, VOLATILE_FIELDS);
}

/** The volatile fields a state has (`Typename.field`): none in a static page. */
export function findVolatileFields(state: unknown): string[] {
  return findFields(state, VOLATILE_FIELDS);
}
