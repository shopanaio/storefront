import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { ServerRequestScope } from '@shopana/storefront-sdk/server/requestScope';

/**
 * The Apollo cache the server render ended with, carried to the browser at the end of the
 * document: what the loaders loaded and what the sections queried while rendering, so the
 * browser hydrates from it instead of querying again. It is the only cache the document
 * carries: the loaders send none of their own.
 */
const GLOBAL_KEY = '__shopanaApolloState';

type StateGlobal = { [GLOBAL_KEY]?: NormalizedCacheObject };

/** The client the app of a request renders with: the one whose cache goes to the browser. */
const renderedClients = new WeakMap<ServerRequestScope, ApolloClient>();

/** Set by the app's Apollo provider in the server render. */
export function rememberRenderedApolloClient(
  scope: ServerRequestScope,
  client: ApolloClient
): void {
  renderedClients.set(scope, client);
}

/**
 * Inline script with the cache of the client the request's app rendered with; empty when the
 * app rendered none (the root error page).
 */
export function apolloStateScript(scope: ServerRequestScope): string {
  const client = renderedClients.get(scope);
  if (!client) return '';
  // `<` escaped: the JSON cannot close the script or open a comment.
  const json = JSON.stringify(client.extract()).replace(/</g, '\\u003c');
  return `<script>window.${GLOBAL_KEY}=${json}</script>`;
}

/**
 * The state the document carried, taken once: the global is cleared, the browser's client
 * holds it from then on. The document's inline scripts run as it is parsed, before the
 * deferred module scripts of the app, so it is there when the app starts.
 */
export function takeApolloState(): NormalizedCacheObject | undefined {
  if (typeof window === 'undefined') return undefined;
  const global = window as unknown as StateGlobal;
  const state = global[GLOBAL_KEY];
  delete global[GLOBAL_KEY];
  return state;
}
