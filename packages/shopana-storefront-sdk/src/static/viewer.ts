import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { RequestQueryResult } from '../graphql/apollo/requestResultCache';
import {
  readBrowserCookie,
  SIGNED_IN_COOKIE,
} from '../modules/session/core/sessionCookies';

/**
 * Fields whose value depends on who looks: a static page carries the guest's (base loyalty
 * points, no votes, no subscription), and the browser asks for the buyer's once it knows them.
 * By type; `*` is any type.
 */
export const VIEWER_FIELDS: Readonly<Record<string, readonly string[]>> = {
  Product: ['loyalty'],
  ProductVariant: ['loyalty'],
  ProductComparisonColumn: ['savedForComparison'],
  '*': ['viewerEngagement', 'viewerCapabilities', 'viewerSubscription'],
};

/** The field name of a normalized field key: arguments come after `(` or `:`. */
function fieldName(key: string): string {
  return key.replace(/[({:].*$/, '');
}

/** Whether a field of an object of `typename` depends on the viewer. */
export function isViewerField(
  typename: string | undefined,
  field: string
): boolean {
  const name = fieldName(field);
  return (
    VIEWER_FIELDS['*'].includes(name) ||
    Boolean(typename && VIEWER_FIELDS[typename]?.includes(name))
  );
}

/** A copy of `value` without the viewer's fields, at any depth. */
function withoutViewerFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutViewerFields);
  if (!value || typeof value !== 'object') return value;
  const record = value as Record<string, unknown>;
  const typename =
    typeof record.__typename === 'string' ? record.__typename : undefined;
  const result: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(record)) {
    if (!isViewerField(typename, key)) result[key] = withoutViewerFields(field);
  }
  return result;
}

/**
 * The Apollo state of a static page without the viewer's fields: what a signed-in buyer's
 * cache takes from it, so their own values are queried instead of the guest's shown.
 */
export function stripViewerFields<
  TState extends NormalizedCacheObject | RequestQueryResult[],
>(state: TState): TState {
  if (Array.isArray(state)) {
    return state.map((result) => ({
      ...result,
      d: withoutViewerFields(result.d),
    })) as TState;
  }
  return withoutViewerFields(state) as TState;
}

/** Whether a query's data shows a field of the viewer, at any depth. */
function showsViewerFields(value: unknown, seen = new Set<object>()): boolean {
  if (!value || typeof value !== 'object' || seen.has(value)) return false;
  seen.add(value);
  if (Array.isArray(value)) {
    return value.some((item) => showsViewerFields(item, seen));
  }
  const record = value as Record<string, unknown>;
  const typename =
    typeof record.__typename === 'string' ? record.__typename : undefined;
  return Object.entries(record).some(
    ([key, field]) =>
      isViewerField(typename, key) || showsViewerFields(field, seen)
  );
}

/**
 * Asks the API again for the queries on screen that show the viewer's fields: with the session
 * or the visitor the browser has now, their values are the buyer's (loyalty points by tier,
 * votes, subscriptions). What the page shows stays until the answers come, so nothing
 * flashes back to a skeleton. Resolves with the number of queries asked again.
 */
export async function refetchViewerQueries(
  client: ApolloClient
): Promise<number> {
  const queries = [...client.getObservableQueries('active')].filter((query) =>
    showsViewerFields(query.getCurrentResult().data)
  );
  await Promise.all(queries.map((query) => query.refetch().catch(() => null)));
  return queries.length;
}

/**
 * Whether this browser has a session: its viewer's fields are its own, not a guest's. Read
 * from the readable flag the session server sets; false on the server.
 */
export function browserHasSession(): boolean {
  return readBrowserCookie(SIGNED_IN_COOKIE) === '1';
}
