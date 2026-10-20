import type {
  ApolloLink,
  InMemoryCacheConfig,
  NormalizedCacheObject,
} from '@apollo/client';

/**
 * Serializable network configuration shared by the server and browser clients.
 * Keep this object free of functions because it crosses the RSC boundary.
 */
export interface ApolloEnvironmentConfig {
  graphqlUrl: string;
  apiKeyHeader: string;
  apiKey: string;
  /** Absent when the store has no customer accounts. */
  applicationAuth?: ApplicationAuthConfig;
}

export type ApplicationAuthScope =
  | 'openid'
  | 'profile'
  | 'email'
  | 'offline_access';

/**
 * Public IAM application of the store, used by the browser for the IAM session endpoints.
 * The OAuth client, its secret and the tokens belong to the storefront session server.
 */
export interface ApplicationAuthConfig {
  /** IAM origin, for example https://iam.example.com. */
  iamUrl: string;
  applicationId: string;
}

/**
 * Runtime-only client customization. Unlike ApolloEnvironmentConfig, these
 * options must be configured in the module that creates the Apollo client.
 */
export interface CreateApolloClientOptions {
  serverCookies?: string;
  /**
   * Access token of the server request (SSR and RSC), read from the session cookie. The
   * browser client takes its token from the session client instead.
   */
  accessToken?: string | null;
  initialState?: NormalizedCacheObject;
  cacheConfig?: InMemoryCacheConfig;
  links?: readonly ApolloLink[];
}
