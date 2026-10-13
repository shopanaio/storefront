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
  applicationAuth: ApplicationAuthConfig;
}

export type ApplicationAuthScope =
  | 'openid'
  | 'profile'
  | 'email'
  | 'offline_access';

/** Serializable configuration for the public IAM OAuth client. */
export interface ApplicationAuthConfig {
  /** IAM origin, for example https://iam.example.com. */
  iamUrl: string;
  applicationId: string;
  clientId: string;
  /** Exact immutable Storefront API resource/audience. */
  resource: string;
  redirectUri: string;
  postLogoutRedirectUri?: string;
  scopes?: readonly ApplicationAuthScope[];
  accessTokenCookieName: string;
}

/**
 * Runtime-only client customization. Unlike ApolloEnvironmentConfig, these
 * options must be configured in the module that creates the Apollo client.
 */
export interface CreateApolloClientOptions {
  serverCookies?: string;
  initialState?: NormalizedCacheObject;
  cacheConfig?: InMemoryCacheConfig;
  links?: readonly ApolloLink[];
}
