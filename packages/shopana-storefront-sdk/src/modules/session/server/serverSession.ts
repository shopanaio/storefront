import type { model } from '../../../model/namespace';
import {
  resolveCookieAttributes,
  serializeCookie as serializeCookieValue,
  type CookieAttributes,
} from '../../../core/cookiePolicy';
import { SIGNED_IN_COOKIE } from '../core/sessionCookies';
import type { StorefrontAuthServerConfig } from './config';
import {
  IamOAuthError,
  IamOAuthServerClient,
  type OAuthTokenResponse,
  type OpenIdUserInfo,
} from './iamOAuth';
import { seal, unseal, type SealedPayload } from './sealedCookie';
import type { LoginMethod } from '../core/types';

/** Access token for SSR, the server Apollo client and `/auth/token`; scoped to the site. */
export const ACCESS_COOKIE = 'shopana_at';
/** Refresh and ID token; sent only to the session handlers under `/auth`. */
export const REFRESH_COOKIE = 'shopana_rt';
const REFRESH_COOKIE_PATH = '/auth';
const REFRESH_LIFETIME_SECONDS = 30 * 24 * 60 * 60;
/** An access token this close to its expiry is refreshed before use. */
const EXPIRY_MARGIN_SECONDS = 60;

export interface AccessCookie extends SealedPayload {
  /** Access token. */
  t: string;
  /** OpenID user, read when the token was issued. */
  u: model.User;
  /** Identifier of a headless sign-in. */
  m?: LoginMethod;
}

interface RefreshCookie extends SealedPayload {
  /** Refresh token. */
  r: string;
  /** ID token, the hint for IAM end-session. */
  i?: string;
  /** Identifier of a headless sign-in, kept for the whole session. */
  m?: LoginMethod;
}

/** What the browser receives from `/auth/token` and `/auth/refresh`. */
export interface ServerSessionPayload {
  user: model.User;
  accessToken: string;
  expiresAt: string;
  loginMethod?: LoginMethod;
}

/** Attributes of a session cookie; SameSite, Secure and Partitioned follow the cookie policy. */
export interface CookieOptions extends CookieAttributes {
  path?: string;
  maxAge: number;
  /** True by default. */
  httpOnly?: boolean;
}

export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions
): string {
  return serializeCookieValue(name, value, {
    ...options,
    maxAge: Math.max(0, Math.floor(options.maxAge)),
    httpOnly: options.httpOnly !== false,
  });
}

export function parseCookieHeader(
  header: string | null | undefined
): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    const name = part.slice(0, index).trim();
    if (!name || cookies.has(name)) continue;
    try {
      cookies.set(name, decodeURIComponent(part.slice(index + 1).trim()));
    } catch {
      cookies.set(name, part.slice(index + 1).trim());
    }
  }
  return cookies;
}

export function mapOpenIdUser(user: OpenIdUserInfo): model.User {
  return {
    id: user.sub,
    email: user.email ?? '',
    firstName: user.given_name ?? undefined,
    lastName: user.family_name ?? undefined,
    phone: user.phone_number ?? undefined,
  };
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function tokenExpiry(tokens: OAuthTokenResponse): number {
  return tokens.expires_at ?? nowSeconds() + tokens.expires_in;
}

/** Opens the access cookie of a request; null when it is missing, forged or expired. */
export function readAccessCookie(
  config: StorefrontAuthServerConfig,
  cookies: Map<string, string>
): Promise<AccessCookie | null> {
  return unseal<AccessCookie>(
    config.sessionSecret,
    ACCESS_COOKIE,
    cookies.get(ACCESS_COOKIE)
  );
}

export function toSessionPayload(access: AccessCookie): ServerSessionPayload {
  return {
    user: access.u,
    accessToken: access.t,
    expiresAt: new Date(access.exp * 1000).toISOString(),
    ...(access.m ? { loginMethod: access.m } : {}),
  };
}

export function isFresh(access: AccessCookie): boolean {
  return access.exp - EXPIRY_MARGIN_SECONDS > nowSeconds();
}

/**
 * The outcome of a refresh shared by every request that sent the same refresh token. IAM may
 * rotate the refresh token on use, so two tabs refreshing at once must not both spend it.
 */
interface RefreshOutcome {
  access: AccessCookie;
  refresh: RefreshCookie;
}

const REFRESH_REUSE_MS = 30_000;
const refreshFlights = new Map<string, Promise<RefreshOutcome>>();

/** The cookies a successful sign-in or refresh sets, and the session they hold. */
export interface IssuedSession {
  setCookies: string[];
  session: ServerSessionPayload;
}

export class StorefrontSessionServer {
  readonly iam: IamOAuthServerClient;
  readonly secure: boolean;
  readonly origin: string;
  /**
   * SameSite, Secure and Partitioned of every cookie the session handlers set or delete; a
   * partitioned cookie is deleted only with the same attributes.
   */
  readonly cookieAttributes: CookieAttributes;

  constructor(readonly config: StorefrontAuthServerConfig) {
    this.iam = new IamOAuthServerClient(config);
    this.origin = new URL(config.redirectUri).origin;
    this.secure = this.origin.startsWith('https:');
    this.cookieAttributes = resolveCookieAttributes(config.cookiePolicy, {
      secure: this.secure,
    });
  }

  /**
   * Seals the tokens of a code exchange or a refresh into the session cookies. A headless
   * sign-in names its `loginMethod`; a refresh keeps the one of the `previous` cookie.
   */
  async issue(
    tokens: OAuthTokenResponse,
    previous?: RefreshCookie,
    loginMethod?: LoginMethod
  ): Promise<RefreshOutcome> {
    const user = mapOpenIdUser(await this.iam.userInfo(tokens.access_token));
    const method = loginMethod ?? previous?.m;
    const access: AccessCookie = {
      t: tokens.access_token,
      u: user,
      exp: tokenExpiry(tokens),
      ...(method ? { m: method } : {}),
    };
    const refreshToken = tokens.refresh_token ?? previous?.r;
    if (!refreshToken) {
      throw new IamOAuthError('IAM issued no refresh token', 502);
    }
    const refresh: RefreshCookie = {
      r: refreshToken,
      i: tokens.id_token ?? previous?.i,
      exp: nowSeconds() + REFRESH_LIFETIME_SECONDS,
      ...(method ? { m: method } : {}),
    };
    return { access, refresh };
  }

  async sessionCookies(outcome: RefreshOutcome): Promise<IssuedSession> {
    const secret = this.config.sessionSecret;
    const accessMaxAge = outcome.access.exp - nowSeconds();
    return {
      setCookies: [
        serializeCookie(
          ACCESS_COOKIE,
          await seal(secret, ACCESS_COOKIE, outcome.access),
          { maxAge: accessMaxAge, ...this.cookieAttributes }
        ),
        serializeCookie(
          REFRESH_COOKIE,
          await seal(secret, REFRESH_COOKIE, outcome.refresh),
          {
            path: REFRESH_COOKIE_PATH,
            maxAge: REFRESH_LIFETIME_SECONDS,
            ...this.cookieAttributes,
          }
        ),
        serializeCookie(SIGNED_IN_COOKIE, '1', {
          maxAge: REFRESH_LIFETIME_SECONDS,
          httpOnly: false,
          ...this.cookieAttributes,
        }),
      ],
      session: toSessionPayload(outcome.access),
    };
  }

  clearSessionCookies(): string[] {
    return [
      serializeCookie(ACCESS_COOKIE, '', {
        maxAge: 0,
        ...this.cookieAttributes,
      }),
      serializeCookie(REFRESH_COOKIE, '', {
        path: REFRESH_COOKIE_PATH,
        maxAge: 0,
        ...this.cookieAttributes,
      }),
      serializeCookie(SIGNED_IN_COOKIE, '', {
        maxAge: 0,
        httpOnly: false,
        ...this.cookieAttributes,
      }),
    ];
  }

  readRefreshCookie(
    cookies: Map<string, string>
  ): Promise<RefreshCookie | null> {
    return unseal<RefreshCookie>(
      this.config.sessionSecret,
      REFRESH_COOKIE,
      cookies.get(REFRESH_COOKIE)
    );
  }

  /**
   * Exchanges the refresh token once for all concurrent requests that carry it. A request that
   * arrives shortly after with the spent token gets the same result.
   */
  refresh(refresh: RefreshCookie, endUserIp?: string): Promise<RefreshOutcome> {
    let flight = refreshFlights.get(refresh.r);
    if (!flight) {
      flight = this.iam
        .refresh(refresh.r, endUserIp)
        .then((tokens) => this.issue(tokens, refresh));
      refreshFlights.set(refresh.r, flight);
      const forget = () => {
        setTimeout(() => refreshFlights.delete(refresh.r), REFRESH_REUSE_MS);
      };
      flight.then(forget, () => refreshFlights.delete(refresh.r));
    }
    return flight;
  }
}

let cachedServer: StorefrontSessionServer | null = null;

export function getStorefrontSessionServer(
  config: StorefrontAuthServerConfig
): StorefrontSessionServer {
  if (!cachedServer || cachedServer.config !== config) {
    cachedServer = new StorefrontSessionServer(config);
  }
  return cachedServer;
}

/** Whether a failed IAM call says the grant is gone, as opposed to IAM being unreachable. */
export function isRejectedGrant(error: unknown): boolean {
  return (
    error instanceof IamOAuthError &&
    error.status >= 400 &&
    error.status < 500 &&
    error.status !== 429
  );
}
