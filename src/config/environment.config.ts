import type { ApolloEnvironmentConfig } from '@shopana/storefront-sdk/graphql/apollo';

const apiKeyHeader = 'X-Api-Key';

export const environmentConfig: ApolloEnvironmentConfig = {
  graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL!,
  apiKeyHeader: apiKeyHeader!,
  apiKey: process.env.NEXT_PUBLIC_API_KEY!,
  accessTokenCookieName: 'accessToken',
};
