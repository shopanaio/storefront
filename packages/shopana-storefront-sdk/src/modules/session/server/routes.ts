import {
  AUTH_EVENT_COOKIE,
  AUTH_RESULT_PARAM,
  SESSION_REQUEST_HEADER,
  authResultOfError,
  type AuthResult,
} from '../core/sessionCookies';
import {
  getStorefrontAuthServerConfig,
  type StorefrontAuthServerConfig,
} from './config';
import { randomBase64Url, sha256Base64Url } from './encoding';
import { decodeJwtPayload } from './iamOAuth';
import { seal, unseal, type SealedPayload } from './sealedCookie';
import type { LoginMethod } from '../core/types';
import {
  getStorefrontSessionServer,
  isFresh,
  isRejectedGrant,
  parseCookieHeader,
  readAccessCookie,
  serializeCookie,
  toSessionPayload,
  type StorefrontSessionServer,
} from './serverSession';

/**
 * Route handlers of the storefront session (BFF, design F0), mounted by the runtime at
 * `/auth/[action]`:
 *
 * - `GET  /auth/login?returnTo=&prompt=` starts the authorization code + PKCE flow;
 * - `GET  /auth/callback` exchanges the code with the client secret and sets the cookies;
 * - `GET  /auth/token` returns the current access token, refreshing it when needed;
 * - `POST /auth/refresh` refreshes the access token now;
 * - `POST /auth/logout` revokes the tokens, clears the session and the cart cookie.
 */

const TRANSACTION_LIFETIME_SECONDS = 10 * 60;
const AUTH_EVENT_LIFETIME_SECONDS = 2 * 60;
const CART_COOKIE_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const PROMPTS = new Set(['login', 'create', 'select_account', 'consent']);

/**
 * Authorization request this browser is waiting on at `/auth/callback`. The headless social
 * sign-in writes the same cookie before it leaves for the provider.
 */
export interface TransactionCookie extends SealedPayload {
  state: string;
  nonce: string;
  verifier: string;
  returnTo: string;
  /** Identifier of the headless social sign-in this transaction completes. */
  loginMethod?: LoginMethod;
}

/** Context Next.js passes to an `/auth/[action]` route handler. */
export interface RouteContext {
  params: Promise<{ action?: string | string[] }>;
}

export interface StorefrontAuthRouteHandlers {
  GET(request: Request, context: RouteContext): Promise<Response>;
  POST(request: Request, context: RouteContext): Promise<Response>;
}

export function createStorefrontAuthRouteHandlers(
  readConfig: () => StorefrontAuthServerConfig | null = getStorefrontAuthServerConfig
): StorefrontAuthRouteHandlers {
  const withServer =
    (
      handlers: Record<
        string,
        (request: Request, server: StorefrontSessionServer) => Promise<Response>
      >
    ) =>
    async (request: Request, context: RouteContext): Promise<Response> => {
      const { action } = await context.params;
      const handler = typeof action === 'string' ? handlers[action] : undefined;
      if (!handler) return json(404, { error: 'not_found' });
      const config = readConfig();
      if (!config) return json(404, { error: 'customer_accounts_disabled' });
      return handler(request, getStorefrontSessionServer(config));
    };

  return {
    GET: withServer({ login, callback, token: currentToken }),
    POST: withServer({ refresh: refreshNow, logout }),
  };
}

async function login(
  request: Request,
  server: StorefrontSessionServer
): Promise<Response> {
  const url = new URL(request.url);
  const returnTo = safeReturnTo(
    url.searchParams.get('returnTo'),
    server.origin
  );
  const prompt = url.searchParams.get('prompt') ?? undefined;
  const transaction: TransactionCookie = {
    state: randomBase64Url(32),
    nonce: randomBase64Url(32),
    verifier: randomBase64Url(64),
    returnTo,
    exp: nowSeconds() + TRANSACTION_LIFETIME_SECONDS,
  };
  const name = transactionCookieName(server);
  const location = server.iam.authorizationUrl({
    state: transaction.state,
    nonce: transaction.nonce,
    codeChallenge: await sha256Base64Url(transaction.verifier),
    prompt: prompt && PROMPTS.has(prompt) ? prompt : undefined,
  });
  return redirect(location, [
    serializeCookie(
      name,
      await seal(server.config.sessionSecret, name, transaction),
      { maxAge: TRANSACTION_LIFETIME_SECONDS, secure: server.secure }
    ),
  ]);
}

async function callback(
  request: Request,
  server: StorefrontSessionServer
): Promise<Response> {
  const url = new URL(request.url);
  const name = transactionCookieName(server);
  const cookies = parseCookieHeader(request.headers.get('cookie'));
  const transaction = await unseal<TransactionCookie>(
    server.config.sessionSecret,
    name,
    cookies.get(name)
  );
  const clearTransaction = serializeCookie(name, '', {
    maxAge: 0,
    secure: server.secure,
  });
  const returnTo = transaction?.returnTo ?? '/';
  const fail = (result: AuthResult) =>
    redirect(withAuthResult(returnTo, result, server.origin), [
      clearTransaction,
    ]);

  // IAM sends `state` with errors too; a callback of another transaction, such as a cross-site
  // link, keeps the transaction cookie and never shows its error.
  if (!transaction || url.searchParams.get('state') !== transaction.state) {
    return redirect(withAuthResult(returnTo, 'failed', server.origin), []);
  }
  const error = url.searchParams.get('error');
  if (error) return fail(authResultOfError(error));
  const code = url.searchParams.get('code');
  if (!code) return fail('failed');

  try {
    const tokens = await server.iam.exchangeCode(
      code,
      transaction.verifier,
      endUserIp(request, server.config.trustedProxyHops)
    );
    if (server.config.scopes.includes('openid')) {
      const claims = tokens.id_token ? decodeJwtPayload(tokens.id_token) : null;
      if (claims?.nonce !== transaction.nonce) return fail('failed');
    }
    const issued = await server.sessionCookies(
      await server.issue(tokens, undefined, transaction.loginMethod)
    );
    return redirect(new URL(returnTo, server.origin).href, [
      clearTransaction,
      ...issued.setCookies,
      serializeCookie(AUTH_EVENT_COOKIE, 'signed-in', {
        maxAge: AUTH_EVENT_LIFETIME_SECONDS,
        httpOnly: false,
        secure: server.secure,
      }),
    ]);
  } catch {
    return fail('failed');
  }
}

async function currentToken(
  request: Request,
  server: StorefrontSessionServer
): Promise<Response> {
  const rejected = rejectCrossSite(request, server);
  if (rejected) return rejected;
  const cookies = parseCookieHeader(request.headers.get('cookie'));
  const access = await readAccessCookie(server.config, cookies);
  if (access && isFresh(access)) {
    return json(200, { session: toSessionPayload(access) });
  }
  return refreshSession(request, server, cookies);
}

async function refreshNow(
  request: Request,
  server: StorefrontSessionServer
): Promise<Response> {
  const rejected = rejectCrossSite(request, server);
  if (rejected) return rejected;
  return refreshSession(
    request,
    server,
    parseCookieHeader(request.headers.get('cookie'))
  );
}

async function refreshSession(
  request: Request,
  server: StorefrontSessionServer,
  cookies: Map<string, string>
): Promise<Response> {
  const refresh = await server.readRefreshCookie(cookies);
  if (!refresh) {
    return json(401, { session: null }, server.clearSessionCookies());
  }
  try {
    const issued = await server.sessionCookies(
      await server.refresh(
        refresh,
        endUserIp(request, server.config.trustedProxyHops)
      )
    );
    return json(200, { session: issued.session }, issued.setCookies);
  } catch (error) {
    if (isRejectedGrant(error)) {
      return json(401, { session: null }, server.clearSessionCookies());
    }
    // IAM is unreachable or rate-limited: the session is kept for the next attempt.
    return json(503, { error: 'session_unavailable' });
  }
}

async function logout(
  request: Request,
  server: StorefrontSessionServer
): Promise<Response> {
  const rejected = rejectCrossSite(request, server);
  if (rejected) return rejected;
  const cookies = parseCookieHeader(request.headers.get('cookie'));
  const [access, refresh] = await Promise.all([
    readAccessCookie(server.config, cookies),
    server.readRefreshCookie(cookies),
  ]);
  await Promise.all([
    access
      ? server.iam.revoke(access.t, 'access_token').catch(() => undefined)
      : undefined,
    refresh
      ? server.iam.revoke(refresh.r, 'refresh_token').catch(() => undefined)
      : undefined,
  ]);

  const body = (await request.json().catch(() => ({}))) as {
    cartCookieName?: unknown;
  };
  // S5: the account cart stays with the account; this browser starts a new guest cart.
  const cartCookieName =
    typeof body.cartCookieName === 'string' &&
    CART_COOKIE_PATTERN.test(body.cartCookieName)
      ? body.cartCookieName
      : 'cartId';
  const redirectUrl = refresh?.i ? server.iam.endSessionUrl(refresh.i) : null;
  return json(200, { redirectUrl }, [
    ...server.clearSessionCookies(),
    serializeCookie(cartCookieName, '', {
      maxAge: 0,
      httpOnly: false,
      secure: server.secure,
      sameSite: 'Strict',
    }),
  ]);
}

/**
 * The session handlers answer only the storefront's own pages: the custom header cannot be
 * sent cross-origin without a preflight, which these handlers never allow.
 */
export function rejectCrossSite(
  request: Request,
  server: StorefrontSessionServer
): Response | null {
  const fetchSite = request.headers.get('sec-fetch-site');
  const origin = request.headers.get('origin');
  if (
    request.headers.get(SESSION_REQUEST_HEADER) !== '1' ||
    (fetchSite !== null && fetchSite !== 'same-origin') ||
    (origin !== null && origin !== server.origin)
  ) {
    return json(403, { error: 'forbidden' });
  }
  return null;
}

/** Only a path of this storefront; anything else returns to the home page. */
export function safeReturnTo(
  value: string | null | undefined,
  origin: string
): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  try {
    const url = new URL(value, origin);
    if (url.origin !== origin) return '/';
    url.searchParams.delete(AUTH_RESULT_PARAM);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/';
  }
}

function withAuthResult(
  returnTo: string,
  result: AuthResult,
  origin: string
): string {
  const url = new URL(returnTo, origin);
  url.searchParams.set(AUTH_RESULT_PARAM, result);
  return url.href;
}

/** `__Host-` needs HTTPS; a local HTTP storefront uses the plain name. */
export function transactionCookieName(server: StorefrontSessionServer): string {
  return server.secure ? '__Host-shopana_auth_tx' : 'shopana_auth_tx';
}

/**
 * The buyer address: the `X-Forwarded-For` entry added by the outermost trusted proxy, counted
 * `trustedProxyHops` from the right. A proxy appends the address it saw, so entries left of it
 * come from the client and may be forged. Without `X-Forwarded-For`, `X-Real-IP` of the proxy.
 */
export function endUserIp(
  request: Request,
  trustedProxyHops = 1
): string | undefined {
  const forwarded = (request.headers.get('x-forwarded-for') ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (forwarded.length > 0) {
    return forwarded[Math.max(0, forwarded.length - trustedProxyHops)];
  }
  return request.headers.get('x-real-ip')?.trim() || undefined;
}

function redirect(location: string, setCookies: string[]): Response {
  const headers = new Headers({
    Location: location,
    'Cache-Control': 'no-store',
  });
  setCookies.forEach((cookie) => headers.append('Set-Cookie', cookie));
  return new Response(null, { status: 302, headers });
}

function json(
  status: number,
  body: unknown,
  setCookies: string[] = []
): Response {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  });
  setCookies.forEach((cookie) => headers.append('Set-Cookie', cookie));
  return new Response(JSON.stringify(body), { status, headers });
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}
