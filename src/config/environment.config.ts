import type { RelayEnvironmentConfig } from '@shopana/storefront-sdk';

const apiKeyHeader = {
  shopana: 'X-Api-Key',
  shopify: 'X-Shopify-Storefront-Access-Token',
}[process.env.NEXT_PUBLIC_CMS_PROVIDER!];

export const environmentConfig: RelayEnvironmentConfig = {
  graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL!,
  apiKeyHeader: apiKeyHeader!,
  apiKey: process.env.NEXT_PUBLIC_API_KEY!,
  accessTokenCookieName: 'accessToken',
  cacheTTL: 5 * 60 * 1000,
  cacheSize: 100,
};
