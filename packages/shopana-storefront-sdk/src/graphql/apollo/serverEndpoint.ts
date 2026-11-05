import type { ApolloEnvironmentConfig } from './types';

/** `STOREFRONT_SERVER_GRAPHQL_URL`: the internal address of the gateway, for server requests. */
export function directGatewayUrl(): string | undefined {
  return process.env.STOREFRONT_SERVER_GRAPHQL_URL?.trim() || undefined;
}

/**
 * The GraphQL address of server requests: the internal address of the gateway, read from the
 * process environment and never sent to the browser, or the public address of the config. It
 * stays out of the config, which crosses into browser code.
 */
export function serverGraphqlUrl(config: ApolloEnvironmentConfig): string {
  return directGatewayUrl() ?? config.graphqlUrl;
}
