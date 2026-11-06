/**
 * What a rendered page is made of, read from the Apollo state the document carries (a
 * normalized cache, or the whole responses of the server's queries): the entities of the
 * catalog and the content it shows, for the index of which pages an event changes, and the
 * moment its data changes by itself (a promotion that starts or ends).
 */

/** Types whose change makes a page stale; others (connections, money) live inside them. */
export const STATIC_ENTITY_TYPENAMES: ReadonlySet<string> = new Set([
  'Product',
  'ProductVariant',
  'Category',
  'Collection',
  'Vendor',
  'OnlineStorePage',
  'OnlineStoreNavigationMenu',
  'StorefrontPromotion',
  'StorePolicy',
  'Store',
  'MediaImage',
]);

/** Fields of a moment the page's data changes at without an event. */
const TIME_FIELDS: ReadonlySet<string> = new Set([
  'validUntil',
  'endsAt',
  'startsAt',
  'activeFrom',
  'activeTo',
]);

export interface StaticPageIndex {
  /** `Typename:id` of every entity the page shows, sorted. */
  entities: string[];
  /**
   * The earliest moment after `renderedAt` at which the page's data changes by itself; null
   * when none is known.
   */
  validUntil: string | null;
}

/** Cache records reference each other: a reference is followed through its own record. */
function isReference(value: object): value is { __ref: string } {
  return typeof (value as { __ref?: unknown }).__ref === 'string';
}

/** The entities and the next moment of change of an Apollo state rendered at `renderedAt`. */
export function indexStaticPage(
  state: unknown,
  renderedAt: Date
): StaticPageIndex {
  const entities = new Set<string>();
  let next: number | null = null;
  const after = renderedAt.getTime();
  const seen = new Set<object>();

  const visit = (value: unknown) => {
    if (!value || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    if (isReference(value)) return;
    const record = value as Record<string, unknown>;
    const typename = record.__typename;
    if (
      typeof typename === 'string' &&
      STATIC_ENTITY_TYPENAMES.has(typename) &&
      (typeof record.id === 'string' || typeof record.id === 'number')
    ) {
      entities.add(`${typename}:${record.id}`);
    }
    for (const [field, fieldValue] of Object.entries(record)) {
      // Arguments are part of a normalized field's name: `validUntil({...})` is still one.
      const name = field.replace(/[({:].*$/, '');
      if (TIME_FIELDS.has(name) && typeof fieldValue === 'string') {
        const time = Date.parse(fieldValue);
        if (
          Number.isFinite(time) &&
          time > after &&
          (next === null || time < next)
        ) {
          next = time;
        }
      }
      visit(fieldValue);
    }
  };
  visit(state);

  return {
    entities: [...entities].sort(),
    validUntil: next === null ? null : new Date(next).toISOString(),
  };
}
