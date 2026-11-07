import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { RequestQueryResult } from '../graphql/apollo/requestResultCache';
import {
  readBrowserCookie,
  SIGNED_IN_COOKIE,
} from '../modules/session/core/sessionCookies';
import {
  type FieldTable,
  isTableField,
  showsFields,
  stripFields,
} from './fieldClasses';

/**
 * Fields whose value depends on who looks: a static page carries the guest's (base loyalty
 * points, no votes, no subscription), and the browser asks for the buyer's once it knows them.
 * By type; `*` is any type.
 */
export const VIEWER_FIELDS: FieldTable = {
  Product: ['loyalty'],
  ProductVariant: ['loyalty'],
  ProductComparisonColumn: ['savedForComparison'],
  '*': ['viewerEngagement', 'viewerCapabilities', 'viewerSubscription'],
};

/** Whether a field of an object of `typename` depends on the viewer. */
export function isViewerField(
  typename: string | undefined,
  field: string
): boolean {
  return isTableField(VIEWER_FIELDS, typename, field);
}

/**
 * The Apollo state of a static page without the viewer's fields: what a signed-in buyer's
 * cache takes from it, so their own values are queried instead of the guest's shown.
 */
export function stripViewerFields<
  TState extends NormalizedCacheObject | RequestQueryResult[],
>(state: TState): TState {
  return stripFields(state, VIEWER_FIELDS);
}

/** Whether a query's data shows a field of the viewer, at any depth. */
export function showsViewerFields(value: unknown): boolean {
  return showsFields(value, VIEWER_FIELDS);
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
