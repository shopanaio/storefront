/**
 * Server-only storefront session (BFF). Import it from route handlers and server components
 * only: it reads the client secret and the session key from the server environment.
 */
import type { Session } from '../core/types';
import { SIGNED_IN_COOKIE } from '../core/sessionCookies';
import { getStorefrontAuthServerConfig } from './config';
import { parseCookieHeader, readAccessCookie } from './serverSession';

export {
  readStorefrontAuthServerConfig,
  getStorefrontAuthServerConfig,
  type StorefrontAuthServerConfig,
} from './config';
export {
  createStorefrontAuthRouteHandlers,
  endUserIp,
  rejectCrossSite,
  safeReturnTo,
  transactionCookieName,
  type RouteContext,
  type StorefrontAuthRouteHandlers,
  type TransactionCookie,
} from './routes';
// Building blocks for other `/auth/*` handlers, such as the headless sign-in of
// `@shopana/storefront-auth`: they share the session cookies and the session key.
export {
  END_USER_IP_HEADER,
  IamOAuthError,
  clientBasicAuthorization,
  decodeJwtPayload,
  retryAfterSeconds,
  type OAuthTokenResponse,
} from './iamOAuth';
export { randomBase64Url, sha256Base64Url } from './encoding';
export { seal, unseal, type SealedPayload } from './sealedCookie';
export {
  getStorefrontSessionServer,
  isRejectedGrant,
  parseCookieHeader,
  readAccessCookie,
  serializeCookie,
  type IssuedSession,
  type ServerSessionPayload,
  type StorefrontSessionServer,
} from './serverSession';

export interface ServerAuthState {
  /** Valid access token of this request, for the server Apollo client. */
  accessToken: string | null;
  /** The signed-in user, when the access token is valid. */
  session: Session | null;
  /**
   * The browser has a session whose access token expired: the page renders without account
   * data and the browser refreshes the session. Account-owned reads such as the cart must
   * wait for it instead of reading as a guest.
   */
  refreshPending: boolean;
}

const ANONYMOUS: ServerAuthState = {
  accessToken: null,
  session: null,
  refreshPending: false,
};

let reportedConfigError = false;

/**
 * Reads the session of a server request from its Cookie header. A partly configured session
 * server is reported once and the page renders for guests: the `/auth` handlers still fail
 * loudly, but the store stays up.
 */
export async function readServerAuthState(
  cookieHeader: string | null | undefined
): Promise<ServerAuthState> {
  let config: ReturnType<typeof getStorefrontAuthServerConfig>;
  try {
    config = getStorefrontAuthServerConfig();
  } catch (error) {
    if (!reportedConfigError) {
      reportedConfigError = true;
      console.error(error);
    }
    return ANONYMOUS;
  }
  if (!config || !cookieHeader) return ANONYMOUS;
  const cookies = parseCookieHeader(cookieHeader);
  const access = await readAccessCookie(config, cookies);
  if (!access) {
    return {
      ...ANONYMOUS,
      refreshPending: cookies.get(SIGNED_IN_COOKIE) === '1',
    };
  }
  return {
    accessToken: access.t,
    session: {
      user: access.u,
      expiresAt: new Date(access.exp * 1000).toISOString(),
      ...(access.m ? { loginMethod: access.m } : {}),
    },
    refreshPending: false,
  };
}
