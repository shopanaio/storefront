import {
  Environment,
  Network,
  RecordSource,
  Store,
  RequestParameters,
  Variables,
  GraphQLResponse,
  CacheConfig,
  QueryResponseCache,
} from "relay-runtime";
import accessTokenUtils from "../utils/accessToken";
import { getSDKConfig } from "../config";

const IS_SERVER = typeof window === "undefined";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes instead of 5 seconds

const apiKeyHeaderMap: Record<string, string> = {
  shopana: "X-Api-Key",
  shopify: "X-Shopify-Storefront-Access-Token",
};

const responseCache: QueryResponseCache | null = IS_SERVER
  ? null
  : new QueryResponseCache({
    size: 100,
    ttl: CACHE_TTL,
  });

async function fetchGraphQL(
  request: RequestParameters,
  variables: Variables,
  serverCookies?: string
): Promise<GraphQLResponse> {
  const { apiEndpoint, apiKey, cmsProvider } = getSDKConfig();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const apiKeyHeader = apiKeyHeaderMap[cmsProvider];
  if (apiKey && apiKeyHeader) {
    headers[apiKeyHeader] = apiKey;
  }

  // Get token using utility
  const accessToken = accessTokenUtils.getAccessTokenFromCookie(serverCookies);

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: request.text,
      variables,
    }),
  });

  const json = await response.json();

  return json;
}

function createNetwork(serverCookies?: string) {
  return Network.create(
    async (params, variables, cacheConfig: CacheConfig) => {
      const isQuery = params.operationKind === "query";
      const cacheKey = params.id ?? params.cacheID;
      const forceFetch = cacheConfig && cacheConfig.force;

      if (responseCache && isQuery && !forceFetch) {
        const fromCache = responseCache.get(cacheKey, variables);
        if (fromCache != null) {
          return Promise.resolve(fromCache);
        }
      }

      const response = await fetchGraphQL(params, variables, serverCookies);
      if (responseCache && isQuery) {
        responseCache.set(cacheKey, variables, response);
      }

      return response;
    }
  );
}

function createEnvironment(serverCookies?: string) {
  return new Environment({
    network: createNetwork(serverCookies),
    store: new Store(new RecordSource()),
    isServer: IS_SERVER,
  });
}

const clientEnvironment = !IS_SERVER ? createEnvironment() : null;

export function getCurrentEnvironment(serverCookies?: string) {
  return IS_SERVER ? createEnvironment(serverCookies) : clientEnvironment!;
}

export { responseCache };
export const networkFetch = fetchGraphQL;
