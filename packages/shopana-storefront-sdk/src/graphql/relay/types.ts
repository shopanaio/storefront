import { RequestParameters, Variables, GraphQLResponse } from "relay-runtime";

export interface RelayEnvironmentConfig {
  /**
   * GraphQL endpoint URL
   */
  graphqlUrl: string;

  /**
   * API key header name (e.g., 'X-Api-Key' for Shopana, 'X-Shopify-Storefront-Access-Token' for Shopify)
   */
  apiKeyHeader: string;

  /**
   * API key value
   */
  apiKey: string;

  /**
   * Cookie name for access token (default: 'accessToken')
   */
  accessTokenCookieName?: string;

  /**
   * Cache TTL in milliseconds (default: 5 minutes)
   */
  cacheTTL?: number;

  /**
   * Cache size (default: 100)
   */
  cacheSize?: number;
}

export interface FetchGraphQLOptions {
  graphqlUrl: string;
  apiKeyHeader: string;
  apiKey: string;
  accessTokenCookieName?: string;
  serverCookies?: string;
}

export type FetchGraphQLFunction = (
  request: RequestParameters,
  variables: Variables,
  serverCookies?: string
) => Promise<GraphQLResponse>;
