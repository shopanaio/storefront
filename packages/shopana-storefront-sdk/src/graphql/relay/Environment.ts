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
import type { RelayEnvironmentConfig, FetchGraphQLOptions } from "./types";

const IS_SERVER = typeof window === "undefined";

/**
 * Get access token from cookies
 */
function getAccessTokenFromCookie(
  cookieName: string,
  serverCookies?: string
): string | null {
  if (IS_SERVER) {
    if (serverCookies) {
      const regex = new RegExp(`(?:^|; )${cookieName}=([^;]*)`);
      const match = serverCookies.match(regex);
      return match ? decodeURIComponent(match[1]) : null;
    }
    return null;
  }
  // Client: read from document.cookie
  const match = document.cookie.match(new RegExp(`(?:^|; )${cookieName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Create fetchGraphQL function with provided configuration
 */
export function createFetchGraphQL(options: FetchGraphQLOptions) {
  return async function fetchGraphQL(
    request: RequestParameters,
    variables: Variables,
    serverCookies?: string
  ): Promise<GraphQLResponse> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      [options.apiKeyHeader]: options.apiKey,
    };

    // Get access token from cookie
    if (options.accessTokenCookieName) {
      const accessToken = getAccessTokenFromCookie(
        options.accessTokenCookieName,
        serverCookies ?? options.serverCookies
      );
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }
    }

    const response = await fetch(options.graphqlUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: request.text,
        variables,
      }),
    });

    const json = await response.json();

    return json;
  };
}

/**
 * Create Relay Network with optional response cache
 */
export function createNetwork(
  fetchGraphQL: (
    request: RequestParameters,
    variables: Variables,
    serverCookies?: string
  ) => Promise<GraphQLResponse>,
  responseCache: QueryResponseCache | null,
  serverCookies?: string
) {
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

/**
 * Create Relay Environment with provided configuration
 */
export function createEnvironment(
  config: RelayEnvironmentConfig,
  serverCookies?: string
): Environment {
  const fetchGraphQL = createFetchGraphQL({
    graphqlUrl: config.graphqlUrl,
    apiKeyHeader: config.apiKeyHeader,
    apiKey: config.apiKey,
    accessTokenCookieName: config.accessTokenCookieName,
    serverCookies,
  });

  const cacheTTL = config.cacheTTL ?? 5 * 60 * 1000; // 5 minutes
  const cacheSize = config.cacheSize ?? 100;

  const responseCache: QueryResponseCache | null = IS_SERVER
    ? null
    : new QueryResponseCache({
        size: cacheSize,
        ttl: cacheTTL,
      });

  return new Environment({
    network: createNetwork(fetchGraphQL, responseCache, serverCookies),
    store: new Store(new RecordSource()),
    isServer: IS_SERVER,
  });
}

/**
 * Create response cache for client-side
 */
export function createResponseCache(ttl: number = 5 * 60 * 1000, size: number = 100) {
  if (IS_SERVER) {
    return null;
  }
  return new QueryResponseCache({ size, ttl });
}
