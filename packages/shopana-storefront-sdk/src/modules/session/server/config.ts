import type { ApplicationAuthScope } from '../../../graphql/apollo/types';

/**
 * Server-only configuration of the storefront session (BFF). The storefront is a confidential
 * IAM OAuth client: the code is exchanged on the server with the client secret, and the tokens
 * live in encrypted HttpOnly cookies (D10). Nothing here may reach the browser bundle.
 */
export interface StorefrontAuthServerConfig {
  /** IAM origin, for example https://iam.example.com. */
  iamUrl: string;
  applicationId: string;
  clientId: string;
  clientSecret: string;
  /** Exact immutable Storefront API resource/audience. */
  resource: string;
  /** Registered `{origin}/auth/callback`. */
  redirectUri: string;
  /**
   * Registered post-logout URI. When set, sign-out ends the IAM session through
   * `/oauth2/end-session`; otherwise it only revokes the tokens of this storefront.
   */
  postLogoutRedirectUri?: string;
  scopes: readonly ApplicationAuthScope[];
  /** Key material for the session cookies, at least 32 characters. */
  sessionSecret: string;
}

const DEFAULT_SCOPES: readonly ApplicationAuthScope[] = [
  'openid',
  'profile',
  'email',
  'offline_access',
];

const ENV = {
  iamUrl: 'NEXT_PUBLIC_IAM_URL',
  applicationId: 'NEXT_PUBLIC_IAM_APPLICATION_ID',
  clientId: 'IAM_OAUTH_CLIENT_ID',
  clientSecret: 'IAM_OAUTH_CLIENT_SECRET',
  resource: 'IAM_OAUTH_RESOURCE',
  redirectUri: 'IAM_OAUTH_REDIRECT_URI',
  postLogoutRedirectUri: 'IAM_OAUTH_POST_LOGOUT_REDIRECT_URI',
  sessionSecret: 'STOREFRONT_SESSION_SECRET',
} as const;

const MIN_SESSION_SECRET_LENGTH = 32;

/**
 * Reads the session configuration from the server environment. Returns null when the storefront
 * has no customer accounts configured (no IAM application), and throws when it is configured
 * only partly, so a missing secret never degrades into a public client silently.
 */
export function readStorefrontAuthServerConfig(
  env: Record<string, string | undefined> = process.env
): StorefrontAuthServerConfig | null {
  const value = (key: keyof typeof ENV) => env[ENV[key]]?.trim() || undefined;
  if (!value('applicationId')) return null;

  const required = [
    'iamUrl',
    'clientId',
    'clientSecret',
    'resource',
    'redirectUri',
    'sessionSecret',
  ] as const;
  const missing = required.filter((key) => !value(key)).map((key) => ENV[key]);
  if (missing.length > 0) {
    throw new Error(
      `Storefront session configuration is missing: ${missing.join(', ')}`
    );
  }
  const sessionSecret = value('sessionSecret')!;
  if (sessionSecret.length < MIN_SESSION_SECRET_LENGTH) {
    throw new Error(
      `${ENV.sessionSecret} must be at least ${MIN_SESSION_SECRET_LENGTH} characters`
    );
  }

  return {
    iamUrl: value('iamUrl')!.replace(/\/$/, ''),
    applicationId: value('applicationId')!,
    clientId: value('clientId')!,
    clientSecret: value('clientSecret')!,
    resource: value('resource')!,
    redirectUri: value('redirectUri')!,
    postLogoutRedirectUri: value('postLogoutRedirectUri'),
    scopes: DEFAULT_SCOPES,
    sessionSecret,
  };
}

let cachedConfig: StorefrontAuthServerConfig | null | undefined;

/** The process-wide configuration, read once from `process.env`. */
export function getStorefrontAuthServerConfig(): StorefrontAuthServerConfig | null {
  if (cachedConfig === undefined) {
    cachedConfig = readStorefrontAuthServerConfig();
  }
  return cachedConfig;
}
