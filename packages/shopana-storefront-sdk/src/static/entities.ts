/**
 * The moment a rendered page's data changes by itself (a collection whose window opens or
 * closes, a promotion that starts or ends), read from the Apollo state the document carries (a
 * normalized cache, or the whole responses of the server's queries): the coordinator renders
 * the page again then.
 */

/** Fields of a moment the page's data changes at by itself. */
const TIME_FIELDS: ReadonlySet<string> = new Set([
  'validUntil',
  'endsAt',
  'startsAt',
  'activeFrom',
  'activeTo',
]);

export interface StaticPageIndex {
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

/** The next moment of change of an Apollo state rendered at `renderedAt`. */
export function indexStaticPage(
  state: unknown,
  renderedAt: Date
): StaticPageIndex {
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
    for (const [field, fieldValue] of Object.entries(
      value as Record<string, unknown>
    )) {
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
    validUntil: next === null ? null : new Date(next).toISOString(),
  };
}
