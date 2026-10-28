import type { ApolloClient } from '@apollo/client';
import type { ApolloEnvironmentConfig } from '../graphql/apollo/types';
import { getServerRequestScope, type ServerRequestScope } from './requestScope';

/** One storefront API: the clients of a request are shared per API and key. */
export function apolloEnvironmentKey(config: ApolloEnvironmentConfig): string {
  return JSON.stringify([
    config.graphqlUrl,
    config.apiKeyHeader,
    config.apiKey,
  ]);
}

const createdClients = new WeakMap<
  ServerRequestScope,
  Map<string, ApolloClient>
>();

/** Keeps the client a loader of the request scope created, for the server render. */
export function rememberApolloRequestClient(
  config: ApolloEnvironmentConfig,
  client: ApolloClient
): void {
  const scope = getServerRequestScope();
  if (!scope) return;
  let clients = createdClients.get(scope);
  if (!clients) {
    clients = new Map();
    createdClients.set(scope, clients);
  }
  clients.set(apolloEnvironmentKey(config), client);
}

/**
 * The client a loader of the current request scope already created, read without waiting: a
 * server render uses it, so the queries its sections run are sent with the request's session.
 * Null in the browser. This module has no server dependencies, so browser code may import it.
 */
export function peekApolloRequestClient(
  config: ApolloEnvironmentConfig
): ApolloClient | null {
  const scope = getServerRequestScope();
  if (!scope) return null;
  return createdClients.get(scope)?.get(apolloEnvironmentKey(config)) ?? null;
}
