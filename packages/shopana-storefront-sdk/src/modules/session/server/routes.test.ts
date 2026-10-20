// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { StorefrontAuthServerConfig } from './config';
import { createStorefrontAuthRouteHandlers } from './routes';
import { readServerAuthState } from './index';

const origin = 'https://shop.example.test';
const config: StorefrontAuthServerConfig = {
  iamUrl: 'https://iam.example.test',
  applicationId: 'app-1',
  clientId: 'storefront',
  clientSecret: 's3cret value',
  resource: 'urn:shopana:application:app-1',
  redirectUri: `${origin}/auth/callback`,
  postLogoutRedirectUri: `${origin}/`,
  scopes: ['openid', 'profile', 'email', 'offline_access'],
  sessionSecret: 'test-session-secret-0123456789-abcdef',
};
const iamBase = 'https://iam.example.test/auth/applications/app-1';

vi.mock('./config', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./config')>()),
  getStorefrontAuthServerConfig: () => config,
}));

function idToken(claims: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'none' })}.${encode(claims)}.sig`;
}

/** Cookie jar of one browser: applies Set-Cookie answers, sends cookies by path. */
class Jar {
  private cookies = new Map<string, { value: string; path: string }>();

  apply(response: Response) {
    for (const header of response.headers.getSetCookie()) {
      const [pair, ...attributes] = header.split('; ');
      const index = pair.indexOf('=');
      const name = pair.slice(0, index);
      const value = decodeURIComponent(pair.slice(index + 1));
      const path =
        attributes.find((part) => part.startsWith('Path='))?.slice(5) ?? '/';
      const maxAge = attributes.find((part) => part.startsWith('Max-Age='));
      if (maxAge === 'Max-Age=0') this.cookies.delete(name);
      else this.cookies.set(name, { value, path });
    }
  }

  header(pathname: string): string {
    return [...this.cookies]
      .filter(([, cookie]) => pathname.startsWith(cookie.path))
      .map(([name, cookie]) => `${name}=${encodeURIComponent(cookie.value)}`)
      .join('; ');
  }

  has(name: string): boolean {
    return this.cookies.has(name);
  }
}

const handlers = createStorefrontAuthRouteHandlers(() => config);
const context = (action: string) => ({ params: Promise.resolve({ action }) });

function request(
  jar: Jar,
  method: 'GET' | 'POST',
  path: string,
  init: { sameOrigin?: boolean; body?: unknown } = {}
): Request {
  const url = new URL(path, origin);
  const headers = new Headers({ cookie: jar.header(url.pathname) });
  if (init.sameOrigin !== false) {
    headers.set('x-shopana-session', '1');
    headers.set('sec-fetch-site', 'same-origin');
  } else {
    headers.set('sec-fetch-site', 'cross-site');
  }
  return new Request(url, {
    method,
    headers,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
}

async function call(
  jar: Jar,
  method: 'GET' | 'POST',
  path: string,
  init?: { sameOrigin?: boolean; body?: unknown }
): Promise<Response> {
  const action = new URL(path, origin).pathname.split('/')[2];
  const handler = method === 'GET' ? handlers.GET : handlers.POST;
  const response = await handler(request(jar, method, path, init), context(action));
  jar.apply(response);
  return response;
}

let iamCalls: { url: string; init: RequestInit }[];
let issued = 0;
let run = 0;
let refreshRejected = false;
/** Token of the current test; unique across tests, since refreshes are shared by token. */
const tok = (kind: string, n: number) => `${kind}-${run}-${n}`;

beforeEach(() => {
  iamCalls = [];
  issued = 0;
  run += 1;
  refreshRejected = false;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL, init: RequestInit = {}) => {
      const url = String(input);
      iamCalls.push({ url, init });
      if (url === `${iamBase}/oauth2/token`) {
        const body = new URLSearchParams(String(init.body));
        if (body.get('grant_type') === 'refresh_token' && refreshRejected) {
          return Response.json({ error: 'invalid_grant' }, { status: 400 });
        }
        issued += 1;
        const nonce =
          body.get('grant_type') === 'authorization_code'
            ? lastNonce
            : undefined;
        return Response.json({
          access_token: tok('access', issued),
          token_type: 'Bearer',
          expires_in: 900,
          refresh_token: tok('refresh', issued),
          scope: 'openid profile email offline_access',
          id_token: idToken({ sub: 'user-1', sid: 'sid-1', nonce }),
        });
      }
      if (url === `${iamBase}/oauth2/userinfo`) {
        return Response.json({
          sub: 'user-1',
          email: 'buyer@example.test',
          given_name: 'Олена',
        });
      }
      if (url === `${iamBase}/oauth2/revoke`) return Response.json({});
      return new Response('not found', { status: 404 });
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

let lastNonce: string | undefined;

async function signIn(jar: Jar, returnTo = '/checkout?step=1') {
  const login = await call(
    jar,
    'GET',
    `/auth/login?returnTo=${encodeURIComponent(returnTo)}`
  );
  const authorize = new URL(login.headers.get('location')!);
  lastNonce = authorize.searchParams.get('nonce') ?? undefined;
  const state = authorize.searchParams.get('state')!;
  return call(jar, 'GET', `/auth/callback?code=code-1&state=${state}`);
}

describe('storefront session handlers', () => {
  it('signs in as a confidential client and keeps the tokens out of readable cookies', async () => {
    const jar = new Jar();
    const login = await call(jar, 'GET', '/auth/login?returnTo=/checkout');
    expect(login.status).toBe(302);
    const authorize = new URL(login.headers.get('location')!);
    expect(authorize.href.startsWith(`${iamBase}/oauth2/authorize?`)).toBe(true);
    expect(authorize.searchParams.get('client_id')).toBe('storefront');
    expect(authorize.searchParams.get('code_challenge_method')).toBe('S256');
    expect(authorize.searchParams.get('redirect_uri')).toBe(config.redirectUri);

    lastNonce = authorize.searchParams.get('nonce')!;
    const callback = await call(
      jar,
      'GET',
      `/auth/callback?code=code-1&state=${authorize.searchParams.get('state')}`
    );
    expect(callback.status).toBe(302);
    expect(callback.headers.get('location')).toBe(`${origin}/checkout`);

    const exchange = iamCalls.find((entry) => entry.url.endsWith('/oauth2/token'))!;
    const headers = new Headers(exchange.init.headers);
    expect(headers.get('authorization')).toBe(
      `Basic ${btoa('storefront:s3cret+value')}`
    );
    const body = new URLSearchParams(String(exchange.init.body));
    expect(body.get('client_secret')).toBeNull();
    expect(body.get('code_verifier')).toBeTruthy();

    const setCookies = callback.headers.getSetCookie();
    const access = setCookies.find((cookie) => cookie.startsWith('shopana_at='))!;
    const refresh = setCookies.find((cookie) => cookie.startsWith('shopana_rt='))!;
    expect(access).toContain('HttpOnly');
    expect(access).toContain('Secure');
    expect(access).not.toContain(tok('access', 1));
    expect(refresh).toContain('Path=/auth');
    expect(refresh).not.toContain(tok('refresh', 1));
    expect(setCookies.some((cookie) => cookie.startsWith('shopana_signed_in=1'))).toBe(true);
    expect(setCookies.some((cookie) => cookie.startsWith('shopana_auth_event=signed-in'))).toBe(true);

    const state = await readServerAuthState(jar.header('/'));
    expect(state.accessToken).toBe(tok('access', 1));
    expect(state.session?.user).toEqual({
      id: 'user-1',
      email: 'buyer@example.test',
      firstName: 'Олена',
      lastName: undefined,
    });
  });

  it('rejects a callback whose state does not match the transaction', async () => {
    const jar = new Jar();
    await call(jar, 'GET', '/auth/login?returnTo=/checkout');
    const callback = await call(jar, 'GET', '/auth/callback?code=code-1&state=forged');
    expect(callback.headers.get('location')).toBe(`${origin}/checkout?auth=failed`);
    expect(jar.has('shopana_at')).toBe(false);
    expect(iamCalls.some((entry) => entry.url.endsWith('/oauth2/token'))).toBe(false);
  });

  it('returns a cancelled sign-in to the page it started from', async () => {
    const jar = new Jar();
    await call(jar, 'GET', '/auth/login?returnTo=/checkout');
    const callback = await call(jar, 'GET', '/auth/callback?error=access_denied&state=x');
    expect(callback.headers.get('location')).toBe(`${origin}/checkout?auth=cancelled`);
  });

  it('keeps returnTo on this storefront', async () => {
    const jar = new Jar();
    const login = await call(jar, 'GET', '/auth/login?returnTo=//evil.example/x');
    lastNonce = new URL(login.headers.get('location')!).searchParams.get('nonce')!;
    const state = new URL(login.headers.get('location')!).searchParams.get('state');
    const callback = await call(jar, 'GET', `/auth/callback?code=c&state=${state}`);
    expect(callback.headers.get('location')).toBe(`${origin}/`);
  });

  it('hands the access token only to same-origin session requests', async () => {
    const jar = new Jar();
    await signIn(jar);
    const crossSite = await call(jar, 'GET', '/auth/token', { sameOrigin: false });
    expect(crossSite.status).toBe(403);
    const token = await call(jar, 'GET', '/auth/token');
    expect(token.status).toBe(200);
    expect((await token.json()).session.accessToken).toBe(tok('access', 1));
  });

  it('refreshes once for concurrent requests that carry the same refresh token', async () => {
    const jar = new Jar();
    await signIn(jar);
    const [first, second] = await Promise.all([
      call(jar, 'POST', '/auth/refresh'),
      call(jar, 'POST', '/auth/refresh'),
    ]);
    expect((await first.json()).session.accessToken).toBe(tok('access', 2));
    expect((await second.json()).session.accessToken).toBe(tok('access', 2));
    const refreshes = iamCalls.filter(
      (entry) =>
        entry.url.endsWith('/oauth2/token') &&
        String(entry.init.body).includes('grant_type=refresh_token')
    );
    expect(refreshes).toHaveLength(1);
  });

  it('ends the session when IAM rejects the refresh token', async () => {
    const jar = new Jar();
    await signIn(jar);
    refreshRejected = true;
    const refresh = await call(jar, 'POST', '/auth/refresh');
    expect(refresh.status).toBe(401);
    expect(jar.has('shopana_at')).toBe(false);
    expect(jar.has('shopana_signed_in')).toBe(false);
  });

  it('signs out: revokes both tokens, clears the session and the cart cookie', async () => {
    const jar = new Jar();
    await signIn(jar);
    const logout = await call(jar, 'POST', '/auth/logout', {
      body: { cartCookieName: 'cartId' },
    });
    expect(logout.status).toBe(200);
    const { redirectUrl } = await logout.json();
    expect(redirectUrl.startsWith(`${iamBase}/oauth2/end-session?`)).toBe(true);
    const revoked = iamCalls
      .filter((entry) => entry.url.endsWith('/oauth2/revoke'))
      .map((entry) => new URLSearchParams(String(entry.init.body)).get('token'));
    expect(revoked.sort()).toEqual([tok('access', 1), tok('refresh', 1)]);
    const cleared = logout.headers.getSetCookie();
    expect(cleared.some((cookie) => cookie.startsWith('cartId=;'))).toBe(true);
    expect(jar.has('shopana_at')).toBe(false);
    expect(jar.has('shopana_rt')).toBe(false);
  });

  it('marks a page request whose access token expired for a browser refresh', async () => {
    const state = await readServerAuthState('shopana_signed_in=1; cartId=abc');
    expect(state).toEqual({ accessToken: null, session: null, refreshPending: true });
  });
});
