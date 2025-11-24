import {
  createEnvironment as createRelayEnvironment,
  createResponseCache,
  createFetchGraphQL,
} from "@shopana/storefront-sdk/graphql/relay";
import accessTokenUtils from "@src/utils/accessToken";

const IS_SERVER = typeof window === "undefined";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const apiKeyHeader = {
  shopana: "X-Api-Key",
  shopify: "X-Shopify-Storefront-Access-Token",
}[process.env.NEXT_PUBLIC_CMS_PROVIDER!];

export const responseCache = createResponseCache(CACHE_TTL, 100);

// Create fetchGraphQL function for direct use
export const networkFetch = createFetchGraphQL({
  graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL!,
  apiKeyHeader: apiKeyHeader!,
  apiKey: process.env.NEXT_PUBLIC_API_KEY!,
  getAccessToken: accessTokenUtils.getAccessTokenFromCookie,
});

function createEnvironment(serverCookies?: string) {
  return createRelayEnvironment(
    {
      graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL!,
      apiKeyHeader: apiKeyHeader!,
      apiKey: process.env.NEXT_PUBLIC_API_KEY!,
      getAccessToken: accessTokenUtils.getAccessTokenFromCookie,
      cacheTTL: CACHE_TTL,
      cacheSize: 100,
    },
    serverCookies
  );
}

const clientEnvironment = !IS_SERVER ? createEnvironment() : null;

export function getCurrentEnvironment(serverCookies?: string) {
  return IS_SERVER ? createEnvironment(serverCookies) : clientEnvironment!;
}
