import { createFetchGraphQL } from "@shopana/storefront-sdk/graphql/relay";
import { environmentConfig } from "@src/config/environment.config";

export const networkFetch = createFetchGraphQL({
  graphqlUrl: environmentConfig.graphqlUrl,
  apiKeyHeader: environmentConfig.apiKeyHeader,
  apiKey: environmentConfig.apiKey,
  accessTokenCookieName: environmentConfig.accessTokenCookieName,
});
