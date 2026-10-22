// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { StorefrontAuthServerConfig } from '@shopana/storefront-sdk/modules/session/server';
import { createHeadlessAuthRouteHandlers } from './routes';

const origin = 'https://shop.example.test';
const config: StorefrontAuthServerConfig = {
  iamUrl: 'https://iam.example.test',
  applicationId: 'app-1',
  clientId: 'storefront',
  clientSecret: 'secret',
  resource: 'urn:shopana:application:app-1',
  redirectUri: `${origin}/auth/callback`,
  postLogoutRedirectUri: `${origin}/`,
  scopes: ['openid', 'profile', 'email', 'offline_access'],
  sessionSecret: 'test-session-secret-0123456789-abcdef',
};
const iamBase = 'https://iam.example.test/auth/applications/app-1';
const headlessBase = `${iamBase}/headless/v1`;

const handlers = createHeadlessAuthRouteHandlers(() => config);
const context = (action: string) => ({ params: Promise.resolve({ action }) });

function idToken(claims: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'none' })}.${encode(claims)}.sig`;
}

class Jar {
  private cookies = new Map<string, string>();

  apply(response: Response) {
    for (const header of response.headers.getSetCookie()) {
      const [pair, ...attributes] = header.split('; ');
      const index = pair.indexOf('=');
      const name = pair.slice(0, index);
      if (attributes.includes('Max-Age=0')) this.cookies.delete(name);
      else this.cookies.set(name, decodeURIComponent(pair.slice(index + 1)));
    }
  }

  header(): string {
    return [...this.cookies]
      .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
      .join('; ');
  }

  has(name: string): boolean {
    return this.cookies.has(name);
  }
}

/** The buyer forges the first entry; the storefront proxy appends the address it saw. */
const FORWARDED_FOR = '198.51.100.9, 203.0.113.7';

function post(jar: Jar, action: string, body: unknown, init: { sameOrigin?: boolean } = {}) {
  const headers = new Headers({
    cookie: jar.header(),
    'content-type': 'application/json',
    'x-forwarded-for': FORWARDED_FOR,
    'user-agent': 'Vitest',
  });
  if (init.sameOrigin !== false) {
    headers.set('x-shopana-session', '1');
    headers.set('sec-fetch-site', 'same-origin');
  }
  return handlers.POST(
    new Request(`${origin}/auth/headless/${action}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }),
    context(action)
  );
}

function get(action: string) {
  return handlers.GET(
    new Request(`${origin}/auth/headless/${action}`, {
      headers: {
        'x-forwarded-for': FORWARDED_FOR,
        'x-shopana-session': '1',
        'sec-fetch-site': 'same-origin',
      },
    }),
    context(action)
  );
}

/** Max-Age of the headless transaction cookie a response sets. */
function transactionMaxAge(response: Response): number | undefined {
  const header = response.headers
    .getSetCookie()
    .find((cookie) => cookie.startsWith('__Host-shopana_auth_htx='));
  const maxAge = header?.match(/Max-Age=(\d+)/)?.[1];
  return maxAge === undefined ? undefined : Number(maxAge);
}

interface IamCall {
  url: string;
  headers: Headers;
  body: Record<string, unknown> | null;
}

let calls: IamCall[];
let transactionCounter: number;
let startedState: string;
let startedNonce: string;
/** Answers of the IAM step endpoints by step path. */
let steps: Record<string, (call: IamCall) => Response>;
let configurationAnswer: (call: IamCall) => Response;
let tokenAnswer: (() => Response) | null;

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

beforeEach(() => {
  calls = [];
  transactionCounter = 0;
  steps = {};
  tokenAnswer = null;
  configurationAnswer = () => {
    throw new Error('Unexpected configuration call');
  };
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string, init: RequestInit = {}) => {
      const url = String(input);
      const headers = new Headers(init.headers);
      let body: Record<string, unknown> | null = null;
      if (typeof init.body === 'string') body = JSON.parse(init.body);
      else if (init.body instanceof URLSearchParams) {
        body = Object.fromEntries(init.body);
      }
      const call = { url, headers, body };
      calls.push(call);

      if (url === `${headlessBase}/configuration`) return configurationAnswer(call);
      if (url === `${headlessBase}/transactions`) {
        startedState = body!.state as string;
        startedNonce = body!.nonce as string;
        return jsonResponse(201, { transaction_id: `tx-${++transactionCounter}`, expires_in: 600 });
      }
      const step = url.match(/\/transactions\/([^/]+)\/(.+)$/);
      if (step) return steps[step[2]](call);
      if (url === `${iamBase}/oauth2/token`) {
        if (tokenAnswer) return tokenAnswer();
        return jsonResponse(200, {
          access_token: 'access-1',
          refresh_token: 'refresh-1',
          id_token: idToken({ nonce: startedNonce }),
          token_type: 'Bearer',
          expires_in: 900,
        });
      }
      if (url === `${iamBase}/oauth2/userinfo`) {
        return jsonResponse(200, { sub: 'user-1', email: 'buyer@example.test' });
      }
      throw new Error(`Unexpected IAM call ${url}`);
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const completed = () =>
  jsonResponse(200, { status: 'completed', code: 'code-1', state: startedState, iss: iamBase });

describe('headless sign-in handlers', () => {
  it('signs in with a password and sets the session cookies', async () => {
    steps['password/sign-in'] = completed;
    const jar = new Jar();

    const response = await post(jar, 'password-sign-in', {
      email: 'buyer@example.test',
      password: 'correct horse',
    });
    jar.apply(response);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      type: 'completed',
      session: { accessToken: 'access-1', user: { id: 'user-1' } },
    });
    expect(jar.has('__Host-shopana_auth_htx')).toBe(false);
    expect(jar.has('shopana_at')).toBe(true);
    expect(jar.has('shopana_rt')).toBe(true);

    const start = calls[0];
    expect(start.headers.get('authorization')).toBe(`Basic ${btoa('storefront:secret')}`);
    // The entry the buyer forged in front of the proxy is not the buyer address.
    expect(start.headers.get('shopana-end-user-ip')).toBe('203.0.113.7');
    expect(start.headers.get('shopana-end-user-agent')).toBe('Vitest');
    expect(start.headers.has('origin')).toBe(false);
    expect(start.body).toMatchObject({
      redirect_uri: config.redirectUri,
      resource: config.resource,
      code_challenge_method: 'S256',
    });
    const token = calls.find((call) => call.url.endsWith('/oauth2/token'))!;
    expect(token.body).toMatchObject({ grant_type: 'authorization_code', code: 'code-1' });
    expect(token.headers.get('shopana-end-user-ip')).toBe('203.0.113.7');
  });

  it('follows the rotated transaction from code request to verification', async () => {
    steps['email-otp/send'] = () =>
      jsonResponse(200, {
        status: 'otp_sent',
        channel: 'email',
        resend_after: 60,
        expires_in: 300,
        transaction_id: 'tx-rotated',
      });
    steps['email-otp/verify'] = (call) => {
      expect(call.url).toBe(`${headlessBase}/transactions/tx-rotated/email-otp/verify`);
      expect(call.body).toEqual({ email: 'buyer@example.test', otp: '123456' });
      return completed();
    };
    const jar = new Jar();

    const sent = await post(jar, 'email-otp-send', { email: 'buyer@example.test' });
    jar.apply(sent);
    expect(await sent.json()).toEqual({
      type: 'otpSent',
      channel: 'email',
      resendAfter: 60,
      expiresIn: 300,
    });

    const verified = await post(jar, 'email-otp-verify', {
      email: 'buyer@example.test',
      code: '123456',
    });
    expect(verified.status).toBe(200);
    expect((await verified.json()).type).toBe('completed');
  });

  it('asks to start over when a code is verified without a transaction', async () => {
    const response = await post(new Jar(), 'email-otp-verify', {
      email: 'buyer@example.test',
      code: '123456',
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: 'expired' });
  });

  it('starts a new transaction once the cookie has outlived the IAM transaction', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const jar = new Jar();
    steps['email-otp/send'] = () =>
      jsonResponse(200, {
        status: 'otp_sent',
        channel: 'email',
        resend_after: 60,
        expires_in: 300,
        transaction_id: 'tx-rotated',
      });
    const sent = await post(jar, 'email-otp-send', { email: 'buyer@example.test' });
    jar.apply(sent);
    // A rotation keeps the transaction for 10 more minutes; the cookie expires a little sooner.
    expect(transactionMaxAge(sent)).toBeLessThanOrEqual(10 * 60);

    vi.setSystemTime(Date.now() + 10 * 60 * 1000);
    steps['password/sign-in'] = (call) => {
      expect(call.url).toContain('/transactions/tx-2/');
      return completed();
    };
    const response = await post(jar, 'password-sign-in', {
      email: 'buyer@example.test',
      password: 'correct horse',
    });

    expect(response.status).toBe(200);
    expect(transactionCounter).toBe(2);
  });

  it('asks to start over when IAM finds a live transaction spent', async () => {
    const jar = new Jar();
    steps['email-otp/send'] = () =>
      jsonResponse(200, {
        status: 'otp_sent',
        channel: 'email',
        resend_after: 60,
        expires_in: 300,
        transaction_id: 'tx-rotated',
      });
    jar.apply(await post(jar, 'email-otp-send', { email: 'buyer@example.test' }));

    // A parallel step or the fifth failed attempt spent the transaction.
    steps['password/sign-in'] = () =>
      jsonResponse(400, { error: 'transaction_expired', error_description: 'expired' });
    const response = await post(jar, 'password-sign-in', {
      email: 'buyer@example.test',
      password: 'correct horse',
    });
    jar.apply(response);

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: 'expired' });
    expect(transactionCounter).toBe(1);
    expect(jar.has('__Host-shopana_auth_htx')).toBe(false);
  });

  it('clears the transaction when a code is verified on a spent transaction', async () => {
    const jar = new Jar();
    steps['email-otp/send'] = () =>
      jsonResponse(200, {
        status: 'otp_sent',
        channel: 'email',
        resend_after: 60,
        expires_in: 300,
        transaction_id: 'tx-rotated',
      });
    jar.apply(await post(jar, 'email-otp-send', { email: 'buyer@example.test' }));

    steps['email-otp/verify'] = () =>
      jsonResponse(400, { error: 'transaction_expired', error_description: 'expired' });
    const response = await post(jar, 'email-otp-verify', {
      email: 'buyer@example.test',
      code: '123456',
    });
    jar.apply(response);

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: 'expired' });
    expect(jar.has('__Host-shopana_auth_htx')).toBe(false);
  });

  it('signs in with a phone code', async () => {
    steps['phone-otp/send'] = (call) => {
      expect(call.body).toEqual({ phoneNumber: '+380501234567' });
      return jsonResponse(200, {
        status: 'otp_sent',
        channel: 'phone',
        resend_after: 60,
        expires_in: 300,
        transaction_id: 'tx-rotated',
      });
    };
    steps['phone-otp/verify'] = (call) => {
      expect(call.url).toBe(`${headlessBase}/transactions/tx-rotated/phone-otp/verify`);
      expect(call.body).toEqual({ phoneNumber: '+380501234567', code: '123456' });
      return completed();
    };
    const jar = new Jar();

    const sent = await post(jar, 'phone-otp-send', { phone: '+380501234567' });
    jar.apply(sent);
    expect(await sent.json()).toMatchObject({ type: 'otpSent', channel: 'phone' });

    const verified = await post(jar, 'phone-otp-verify', {
      phone: '+380501234567',
      code: '123456',
    });
    expect((await verified.json()).type).toBe('completed');
  });

  it('answers the outcomes of a password sign-up', async () => {
    const signUp = { email: 'buyer@example.test', password: 'correct horse', firstName: 'Ann' };

    steps['password/sign-up'] = (call) => {
      expect(call.body).toEqual(signUp);
      return jsonResponse(409, {
        error: 'user_exists',
        error_description: 'Account already exists',
        transaction_id: 'tx-next',
      });
    };
    const exists = await post(new Jar(), 'password-sign-up', signUp);
    expect(exists.status).toBe(409);
    expect(await exists.json()).toMatchObject({ error: 'userExists' });

    steps['password/sign-up'] = () =>
      jsonResponse(200, {
        status: 'verification_required',
        channel: 'email',
        method: 'otp',
        transaction_id: 'tx-next',
      });
    const verification = new Jar();
    const required = await post(verification, 'password-sign-up', signUp);
    verification.apply(required);
    expect(await required.json()).toEqual({ type: 'verificationRequired', method: 'otp' });
    expect(verification.has('__Host-shopana_auth_htx')).toBe(true);

    steps['password/sign-up'] = () =>
      jsonResponse(200, { status: 'sign_in_required', transaction_id: 'tx-next' });
    const created = await post(new Jar(), 'password-sign-up', signUp);
    expect(await created.json()).toEqual({ type: 'signInRequired' });
  });

  it('answers a rate-limited code exchange with its retry delay', async () => {
    steps['password/sign-in'] = completed;
    tokenAnswer = () =>
      jsonResponse(429, { error: 'slow_down' }, { 'retry-after': '20' });

    const response = await post(new Jar(), 'password-sign-in', {
      email: 'buyer@example.test',
      password: 'correct horse',
    });

    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('20');
    expect(await response.json()).toMatchObject({ error: 'rateLimited', retryAfter: 20 });
  });

  it('revalidates the configuration by its ETag', async () => {
    const configuration = {
      methods: {
        password: { signIn: true, signUp: true, minLength: 8, maxLength: 128 },
        emailOtp: { signIn: true, signUp: false, codeLength: 6 },
        phoneOtp: { signIn: false, signUp: false, codeLength: 6 },
        social: [],
      },
      emailVerificationRequired: true,
      emailVerificationMethod: 'otp',
      defaultLocale: 'uk',
      revision: 3,
    };
    configurationAnswer = (call) =>
      call.headers.get('if-none-match') === '"3"'
        ? new Response(null, { status: 304, headers: { etag: '"3"' } })
        : jsonResponse(200, configuration, { etag: '"3"' });

    const first = await get('configuration');
    const second = await get('configuration');

    const { revision: _revision, ...expected } = configuration;
    expect(await first.json()).toEqual(expected);
    expect(await second.json()).toEqual(expected);
    expect(calls.map((call) => call.headers.get('if-none-match'))).toEqual([null, '"3"']);
  });

  it('maps IAM errors and keeps the rotated transaction', async () => {
    steps['password/sign-in'] = () =>
      jsonResponse(
        429,
        { error: 'slow_down', error_description: 'Slow down', transaction_id: 'tx-next', retry_after: 30 },
        { 'retry-after': '30' }
      );
    const jar = new Jar();

    const response = await post(jar, 'password-sign-in', {
      email: 'buyer@example.test',
      password: 'wrong password',
    });
    jar.apply(response);

    expect(response.status).toBe(429);
    expect(await response.json()).toMatchObject({ error: 'rateLimited', retryAfter: 30 });
    expect(jar.has('__Host-shopana_auth_htx')).toBe(true);

    steps['password/sign-in'] = (call) => {
      expect(call.url).toContain('/transactions/tx-next/');
      return jsonResponse(400, { error: 'invalid_grant', error_description: 'Invalid' });
    };
    const second = await post(jar, 'password-sign-in', {
      email: 'buyer@example.test',
      password: 'wrong password',
    });
    expect(await second.json()).toMatchObject({ error: 'invalidCredentials' });
  });

  it('rejects a completed step with a foreign state', async () => {
    steps['password/sign-in'] = () =>
      jsonResponse(200, { status: 'completed', code: 'code-1', state: 'forged', iss: iamBase });

    const response = await post(new Jar(), 'password-sign-in', {
      email: 'buyer@example.test',
      password: 'correct horse',
    });

    expect(response.status).toBe(400);
    expect(calls.some((call) => call.url.endsWith('/oauth2/token'))).toBe(false);
  });

  it('hands a social sign-in over to the callback transaction', async () => {
    steps['social/start'] = () =>
      jsonResponse(200, { status: 'redirect', url: `${headlessBase}/social/launch?ticket=t` });
    const jar = new Jar();

    const response = await post(jar, 'social-start', {
      provider: 'google',
      returnTo: '/account',
    });
    jar.apply(response);

    expect(await response.json()).toEqual({
      type: 'redirect',
      url: `${headlessBase}/social/launch?ticket=t`,
    });
    expect(jar.has('__Host-shopana_auth_tx')).toBe(true);
    expect(jar.has('__Host-shopana_auth_htx')).toBe(false);
  });

  it('answers only the storefront pages', async () => {
    const response = await post(
      new Jar(),
      'password-sign-in',
      { email: 'buyer@example.test', password: 'correct horse' },
      { sameOrigin: false }
    );
    expect(response.status).toBe(403);
    expect(calls).toHaveLength(0);
  });

  it('rejects a malformed body without calling IAM', async () => {
    const response = await post(new Jar(), 'password-sign-up', { email: 'buyer@example.test' });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: 'invalidInput' });
    expect(calls).toHaveLength(0);
  });
});
