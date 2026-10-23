import {
  decodeJwtPayload,
  endUserIp,
  getStorefrontAuthServerConfig,
  getStorefrontSessionServer,
  isRejectedGrant,
  IamOAuthError,
  parseCookieHeader,
  randomBase64Url,
  readAccessCookie,
  rejectCrossSite,
  safeReturnTo,
  seal,
  sha256Base64Url,
  serializeCookie,
  transactionCookieName,
  unseal,
  type SealedPayload,
  type StorefrontAuthServerConfig,
  type StorefrontSessionServer,
  type TransactionCookie,
} from '@shopana/storefront-sdk/modules/session/server';
import type { LoginMethod } from '@shopana/storefront-sdk/modules/session';
import {
  DEFAULT_EMAIL_VERIFICATION_PATH,
  DEFAULT_PASSWORD_RESET_PATH,
  type AccountConnections,
  type AuthConfiguration,
  type AuthErrorBody,
  type AuthErrorCode,
  type AuthStep,
  type HeadlessAction,
} from '../core/types';
import {
  IamHeadlessClient,
  IamHeadlessError,
  type EndUser,
  type IamAccountConnections,
  type IamHeadlessStep,
  type IamHeadlessStepResponse,
} from './iamHeadless';

/**
 * Headless sign-in handlers (BFF), mounted by the runtime at `/auth/headless/[action]`:
 *
 * - `GET  configuration` — enabled methods and validation rules;
 * - `POST password-sign-in | password-sign-up` — `{ email, password[, firstName, lastName],
 *   verifyPath }`; an unverified email gets a verification link to the `verifyPath` page;
 * - `POST email-otp-send | email-otp-verify` — `{ email[, code] }`;
 * - `POST phone-otp-send | phone-otp-verify` — `{ phone[, code] }`;
 * - `POST social-start` — `{ provider, returnTo }`, answers the provider URL to leave for;
 * - `POST password-forgot` — `{ email, resetPath }`, sends a reset link to that page;
 * - `POST password-reset` — `{ token, password }`, sets the new password (no transaction);
 * - `POST email-verification-resend` — `{ email, verifyPath }`, sends the verification email
 *   again;
 * - `GET  connections`, `POST connection-link | connection-unlink` — social accounts of the
 *   signed-in buyer, with the access token of the session cookie.
 *
 * The IAM transaction, its PKCE verifier, state and nonce live in a sealed cookie; IAM rotates
 * the transaction id on every step, and the cookie follows it. The cookie lives as long as IAM
 * keeps the transaction, so a step on a live cookie that IAM answers with `transaction_expired`
 * means the transaction was spent (a parallel step, too many failed attempts) and the buyer
 * starts over; it is never restarted behind their back (BR-k4h5). A completed step is exchanged
 * for tokens here and answered with the session cookies of `@shopana/storefront-sdk`, so the
 * rest of the session (`/auth/token`, `/auth/refresh`, `/auth/logout`) is unchanged.
 */

/** IAM keeps a headless transaction for at most 30 minutes from its creation (BR-k4h5)… */
const TRANSACTION_MAX_LIFETIME_SECONDS = 30 * 60;
/** …and every rotation extends it by 10 minutes. */
const TRANSACTION_ROTATION_EXTENSION_SECONDS = 10 * 60;
/** The cookie expires this much before IAM's transaction, to absorb clock skew. */
const TRANSACTION_EXPIRY_MARGIN_SECONDS = 30;
/** Lifetime of the callback transaction a social sign-in leaves with. */
const SOCIAL_TRANSACTION_LIFETIME_SECONDS = 10 * 60;

interface HeadlessTransactionCookie extends SealedPayload {
  /** Current IAM transaction id. */
  id: string;
  /** When IAM created the transaction (epoch seconds). */
  created: number;
  state: string;
  nonce: string;
  verifier: string;
}

interface StepDefinition {
  step: IamHeadlessStep;
  /** A step that may start a new transaction; the others continue the current one. */
  entry: boolean;
  /** The identifier a sign-in completed by this step was made with. */
  loginMethod?: LoginMethod;
  body(
    input: Record<string, unknown>,
    session: StorefrontSessionServer
  ): Record<string, unknown> | null;
}

type TransactionAction = Exclude<HeadlessAction, 'password-reset'>;

const STEPS: Record<TransactionAction, StepDefinition> = {
  'password-sign-in': {
    step: 'password/sign-in',
    loginMethod: 'email',
    entry: true,
    body: (input, session) =>
      strings(input, ['email', 'password']) && optionalString(input.verifyPath)
        ? {
            email: input.email,
            password: input.password,
            verify_uri: verifyUri(input, session),
          }
        : null,
  },
  'password-sign-up': {
    step: 'password/sign-up',
    loginMethod: 'email',
    entry: true,
    body: (input, session) =>
      strings(input, ['email', 'password', 'firstName']) &&
      optionalString(input.lastName) &&
      optionalString(input.verifyPath)
        ? {
            email: input.email,
            password: input.password,
            firstName: input.firstName,
            ...(input.lastName ? { lastName: input.lastName } : {}),
            verify_uri: verifyUri(input, session),
          }
        : null,
  },
  'email-otp-send': {
    step: 'email-otp/send',
    entry: true,
    body: (input) =>
      strings(input, ['email']) ? { email: input.email } : null,
  },
  'email-otp-verify': {
    step: 'email-otp/verify',
    loginMethod: 'email',
    entry: false,
    body: (input) =>
      strings(input, ['email', 'code'])
        ? { email: input.email, otp: input.code }
        : null,
  },
  'phone-otp-send': {
    step: 'phone-otp/send',
    entry: true,
    body: (input) =>
      strings(input, ['phone']) ? { phoneNumber: input.phone } : null,
  },
  'phone-otp-verify': {
    step: 'phone-otp/verify',
    loginMethod: 'phone',
    entry: false,
    body: (input) =>
      strings(input, ['phone', 'code'])
        ? { phoneNumber: input.phone, code: input.code }
        : null,
  },
  'social-start': {
    step: 'social/start',
    loginMethod: 'email',
    entry: true,
    body: (input) =>
      strings(input, ['provider']) && optionalString(input.returnTo)
        ? { provider: input.provider }
        : null,
  },
  'password-forgot': {
    step: 'password/forgot',
    entry: true,
    body: (input, session) =>
      strings(input, ['email']) && optionalString(input.resetPath)
        ? {
            email: input.email,
            reset_uri: storefrontUrl(
              session,
              (input.resetPath as string | undefined) ||
                DEFAULT_PASSWORD_RESET_PATH
            ),
          }
        : null,
  },
  'email-verification-resend': {
    step: 'email-verification/resend',
    entry: true,
    body: (input, session) =>
      strings(input, ['email']) && optionalString(input.verifyPath)
        ? { email: input.email, verify_uri: verifyUri(input, session) }
        : null,
  },
};

/** Context Next.js passes to an `/auth/[action]` route handler. */
export interface RouteContext {
  params: Promise<{ action?: string | string[] }>;
}

export interface HeadlessAuthRouteHandlers {
  GET(request: Request, context: RouteContext): Promise<Response>;
  POST(request: Request, context: RouteContext): Promise<Response>;
}

type Handler = (
  request: Request,
  auth: HeadlessAuthServer
) => Promise<Response>;

interface HeadlessAuthServer {
  session: StorefrontSessionServer;
  iam: IamHeadlessClient;
}

const iamClients = new WeakMap<StorefrontSessionServer, IamHeadlessClient>();

export function createHeadlessAuthRouteHandlers(
  readConfig: () => StorefrontAuthServerConfig | null = getStorefrontAuthServerConfig
): HeadlessAuthRouteHandlers {
  const route =
    (handlers: Record<string, Handler>) =>
    async (request: Request, context: RouteContext): Promise<Response> => {
      const { action } = await context.params;
      const handler = typeof action === 'string' ? handlers[action] : undefined;
      if (!handler) return json(404, { error: 'not_found' });
      const config = readConfig();
      if (!config) {
        return error(404, 'disabled', 'Customer accounts are not configured');
      }
      const session = getStorefrontSessionServer(config);
      const rejected = rejectCrossSite(request, session);
      if (rejected) return rejected;
      let iam = iamClients.get(session);
      if (!iam) {
        iam = new IamHeadlessClient(session);
        iamClients.set(session, iam);
      }
      return handler(request, { session, iam });
    };

  const steps = Object.fromEntries(
    (Object.keys(STEPS) as TransactionAction[]).map((action) => [
      action,
      (request: Request, auth: HeadlessAuthServer) =>
        runStep(request, auth, STEPS[action]),
    ])
  );

  return {
    GET: route({ configuration, connections }),
    POST: route({
      ...steps,
      'password-reset': passwordReset,
      'connection-link': connectionLink,
      'connection-unlink': connectionUnlink,
    }),
  };
}

async function configuration(
  request: Request,
  { session, iam }: HeadlessAuthServer
): Promise<Response> {
  const endUser = readEndUser(request, session);
  if (!endUser) return unknownEndUser();
  try {
    const value = await iam.configuration(endUser);
    return json(200, {
      methods: value.methods,
      emailVerificationRequired: value.emailVerificationRequired,
      emailVerificationMethod: value.emailVerificationMethod,
      defaultLocale: value.defaultLocale,
    } satisfies AuthConfiguration);
  } catch (failure) {
    return failed(failure);
  }
}

async function runStep(
  request: Request,
  { session, iam }: HeadlessAuthServer,
  definition: StepDefinition
): Promise<Response> {
  const endUser = readEndUser(request, session);
  if (!endUser) return unknownEndUser();
  const input = await readInput(request);
  const body = input ? definition.body(input, session) : null;
  if (!input || !body)
    return error(400, 'invalidInput', 'Invalid request body');

  const cookieName = headlessCookieName(session);
  const cookies = parseCookieHeader(request.headers.get('cookie'));
  let transaction = await unseal<HeadlessTransactionCookie>(
    session.config.sessionSecret,
    cookieName,
    cookies.get(cookieName)
  );
  if (!transaction && !definition.entry) {
    return error(400, 'expired', 'The sign-in has expired; start again');
  }

  const persist = async (next: HeadlessTransactionCookie) =>
    serializeCookie(
      cookieName,
      await seal(session.config.sessionSecret, cookieName, next),
      { maxAge: next.exp - nowSeconds(), secure: session.secure }
    );
  const clear = serializeCookie(cookieName, '', {
    maxAge: 0,
    secure: session.secure,
  });

  let started = false;
  let result: IamHeadlessStepResponse;
  try {
    if (!transaction) {
      transaction = await begin(iam, endUser);
      started = true;
    }
    result = await iam.step(transaction.id, definition.step, body, endUser);
  } catch (failure) {
    const setCookies: string[] = [];
    if (
      failure instanceof IamHeadlessError &&
      failure.code === 'transaction_expired'
    ) {
      // Spent by a parallel step or by failed attempts: the buyer starts over.
      setCookies.push(clear);
    } else if (
      transaction &&
      failure instanceof IamHeadlessError &&
      failure.transactionId
    ) {
      // The step failed after IAM rotated the transaction; the next attempt uses the new id.
      setCookies.push(
        await persist(rotated(transaction, failure.transactionId))
      );
    } else if (started && transaction) {
      setCookies.push(await persist(transaction));
    }
    return failed(failure, setCookies);
  }
  const current: HeadlessTransactionCookie = transaction;

  switch (result.status) {
    case 'completed':
      return complete(
        request,
        session,
        iam,
        current,
        result,
        clear,
        definition.loginMethod
      );
    case 'redirect':
      return leaveForProvider(
        session,
        current,
        input,
        result.url,
        clear,
        definition.loginMethod
      );
    case 'otp_sent':
      return json(
        200,
        {
          type: 'otpSent',
          channel: result.channel,
          resendAfter: result.resend_after,
          expiresIn: result.expires_in,
        } satisfies AuthStep,
        [await persist(rotated(current, result.transaction_id))]
      );
    case 'verification_required':
      return json(
        200,
        {
          type: 'verificationRequired',
          method: result.method,
        } satisfies AuthStep,
        [await persist(rotated(current, result.transaction_id))]
      );
    case 'sign_in_required':
      return json(200, { type: 'signInRequired' } satisfies AuthStep, [
        await persist(rotated(current, result.transaction_id)),
      ]);
    case 'reset_link_sent':
      return json(200, { type: 'resetLinkSent' } satisfies AuthStep, [
        await persist(rotated(current, result.transaction_id)),
      ]);
    case 'verification_sent':
      return json(200, { type: 'verificationSent' } satisfies AuthStep, [
        await persist(rotated(current, result.transaction_id)),
      ]);
  }
}

/** Sets the new password of a reset link; the link may be opened in any browser. */
async function passwordReset(
  request: Request,
  { session, iam }: HeadlessAuthServer
): Promise<Response> {
  const endUser = readEndUser(request, session);
  if (!endUser) return unknownEndUser();
  const input = await readInput(request);
  if (!input || !strings(input, ['token', 'password'])) {
    return error(400, 'invalidInput', 'Invalid request body');
  }
  try {
    await iam.resetPassword(
      { token: input.token as string, password: input.password as string },
      endUser
    );
    return json(200, { type: 'passwordReset' } satisfies AuthStep);
  } catch (failure) {
    // A spent or expired reset token: the buyer requests a new link.
    if (
      failure instanceof IamHeadlessError &&
      failure.code === 'invalid_grant'
    ) {
      return error(
        400,
        'expired',
        'The reset link has expired; request a new one'
      );
    }
    return failed(failure);
  }
}

async function connections(
  request: Request,
  auth: HeadlessAuthServer
): Promise<Response> {
  return accountAction(request, auth, async (iam, accessToken, endUser) =>
    json(200, toConnections(await iam.accountConnections(accessToken, endUser)))
  );
}

/** Answers the URL the browser leaves for; it returns to `returnTo` with the outcome. */
async function connectionLink(
  request: Request,
  auth: HeadlessAuthServer
): Promise<Response> {
  const input = await readInput(request);
  if (
    !input ||
    !strings(input, ['provider']) ||
    !optionalString(input.returnTo)
  ) {
    return error(400, 'invalidInput', 'Invalid request body');
  }
  return accountAction(request, auth, async (iam, accessToken, endUser) => {
    const url = await iam.linkAccount(
      accessToken,
      {
        provider: input.provider as string,
        return_uri: storefrontUrl(
          auth.session,
          (input.returnTo as string | undefined) ?? '/'
        ),
      },
      endUser
    );
    return json(200, { type: 'redirect', url } satisfies AuthStep);
  });
}

/** Disconnects a provider and answers the connections left. */
async function connectionUnlink(
  request: Request,
  auth: HeadlessAuthServer
): Promise<Response> {
  const input = await readInput(request);
  if (!input || !strings(input, ['provider'])) {
    return error(400, 'invalidInput', 'Invalid request body');
  }
  return accountAction(request, auth, async (iam, accessToken, endUser) => {
    await iam.unlinkAccount(
      accessToken,
      { provider: input.provider as string },
      endUser
    );
    return json(
      200,
      toConnections(await iam.accountConnections(accessToken, endUser))
    );
  });
}

/** An account request on behalf of the buyer whose access token is in the session cookie. */
async function accountAction(
  request: Request,
  { session, iam }: HeadlessAuthServer,
  run: (
    iam: IamHeadlessClient,
    accessToken: string,
    endUser: EndUser
  ) => Promise<Response>
): Promise<Response> {
  const endUser = readEndUser(request, session);
  if (!endUser) return unknownEndUser();
  const access = await readAccessCookie(
    session.config,
    parseCookieHeader(request.headers.get('cookie'))
  );
  if (!access) {
    return error(401, 'signInRequired', 'Sign in to manage the account');
  }
  try {
    return await run(iam, access.t, endUser);
  } catch (failure) {
    return failed(failure);
  }
}

function toConnections(value: IamAccountConnections): AccountConnections {
  return {
    providers: value.providers.map((provider) => ({
      provider: provider.provider,
      enabled: provider.enabled,
      status:
        provider.status === 'not_connected' ? 'notConnected' : provider.status,
    })),
    reauthenticationRequired: value.reauthentication_required,
  };
}

/**
 * Absolute URL of a path of this storefront; anything else is its home page. IAM rejects a URI
 * with a fragment, so it is dropped.
 */
function storefrontUrl(session: StorefrontSessionServer, path: string): string {
  const url = new URL(safeReturnTo(path, session.origin), session.origin);
  url.hash = '';
  return url.href;
}

/** The page of this storefront the email verification link leads to. */
function verifyUri(
  input: Record<string, unknown>,
  session: StorefrontSessionServer
): string {
  return storefrontUrl(
    session,
    (input.verifyPath as string | undefined) || DEFAULT_EMAIL_VERIFICATION_PATH
  );
}

async function readInput(
  request: Request
): Promise<Record<string, unknown> | null> {
  const input: unknown = await request.json().catch(() => null);
  return input !== null && typeof input === 'object' && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : null;
}

async function begin(
  iam: IamHeadlessClient,
  endUser: EndUser
): Promise<HeadlessTransactionCookie> {
  const state = randomBase64Url(32);
  const nonce = randomBase64Url(32);
  const verifier = randomBase64Url(64);
  const created = nowSeconds();
  const started = await iam.startTransaction(
    { state, nonce, codeChallenge: await sha256Base64Url(verifier) },
    endUser
  );
  return {
    id: started.id,
    created,
    state,
    nonce,
    verifier,
    exp: transactionExpiry(created, created + started.expiresIn),
  };
}

/** The transaction under the id IAM rotated it to, extended as IAM extends it. */
function rotated(
  transaction: HeadlessTransactionCookie,
  id: string
): HeadlessTransactionCookie {
  return {
    ...transaction,
    id,
    exp: transactionExpiry(
      transaction.created,
      nowSeconds() + TRANSACTION_ROTATION_EXTENSION_SECONDS
    ),
  };
}

function transactionExpiry(created: number, iamExpiry: number): number {
  return (
    Math.min(iamExpiry, created + TRANSACTION_MAX_LIFETIME_SECONDS) -
    TRANSACTION_EXPIRY_MARGIN_SECONDS
  );
}

/** Exchanges the authorization code of a completed step and sets the session cookies. */
async function complete(
  request: Request,
  session: StorefrontSessionServer,
  iam: IamHeadlessClient,
  transaction: HeadlessTransactionCookie,
  result: Extract<IamHeadlessStepResponse, { status: 'completed' }>,
  clear: string,
  loginMethod: LoginMethod | undefined
): Promise<Response> {
  if (result.state !== transaction.state || result.iss !== iam.issuer) {
    return error(400, 'expired', 'The sign-in could not be completed', [clear]);
  }
  try {
    const tokens = await session.iam.exchangeCode(
      result.code,
      transaction.verifier,
      endUserIp(request, session.config.trustedProxyHops)
    );
    if (session.config.scopes.includes('openid')) {
      const claims = tokens.id_token ? decodeJwtPayload(tokens.id_token) : null;
      if (claims?.nonce !== transaction.nonce) {
        return error(400, 'expired', 'The sign-in could not be completed', [
          clear,
        ]);
      }
    }
    const issued = await session.sessionCookies(
      await session.issue(tokens, undefined, loginMethod)
    );
    return json(
      200,
      { type: 'completed', session: issued.session } satisfies AuthStep,
      [clear, ...issued.setCookies]
    );
  } catch (failure) {
    return failed(failure, [clear]);
  }
}

/**
 * The provider returns to `/auth/callback`, which completes a sign-in from the callback
 * transaction cookie of the session handlers: the headless transaction is handed over to it.
 */
async function leaveForProvider(
  session: StorefrontSessionServer,
  transaction: HeadlessTransactionCookie,
  input: Record<string, unknown>,
  url: string,
  clear: string,
  loginMethod: LoginMethod | undefined
): Promise<Response> {
  const name = transactionCookieName(session);
  const callback: TransactionCookie = {
    state: transaction.state,
    nonce: transaction.nonce,
    verifier: transaction.verifier,
    returnTo: safeReturnTo(
      input.returnTo as string | undefined,
      session.origin
    ),
    exp: nowSeconds() + SOCIAL_TRANSACTION_LIFETIME_SECONDS,
    ...(loginMethod ? { loginMethod } : {}),
  };
  return json(200, { type: 'redirect', url } satisfies AuthStep, [
    clear,
    serializeCookie(
      name,
      await seal(session.config.sessionSecret, name, callback),
      {
        maxAge: SOCIAL_TRANSACTION_LIFETIME_SECONDS,
        secure: session.secure,
      }
    ),
  ]);
}

const IAM_ERRORS: Record<string, { status: number; code: AuthErrorCode }> = {
  invalid_grant: { status: 400, code: 'invalidCredentials' },
  user_exists: { status: 409, code: 'userExists' },
  signup_disabled: { status: 400, code: 'signUpDisabled' },
  not_found: { status: 404, code: 'methodDisabled' },
  invalid_request: { status: 400, code: 'invalidInput' },
  transaction_expired: { status: 400, code: 'expired' },
  slow_down: { status: 429, code: 'rateLimited' },
  delivery_unavailable: { status: 503, code: 'deliveryUnavailable' },
  invalid_token: { status: 401, code: 'signInRequired' },
  reauthentication_required: { status: 403, code: 'reauthenticationRequired' },
  last_login_method: { status: 400, code: 'lastLoginMethod' },
  account_conflict: { status: 409, code: 'accountConflict' },
  linking_failed: { status: 400, code: 'linkingFailed' },
};

function failed(failure: unknown, setCookies: string[] = []): Response {
  if (failure instanceof IamHeadlessError) {
    const known = IAM_ERRORS[failure.code];
    if (known) {
      return error(
        known.status,
        known.code,
        failure.message,
        setCookies,
        failure.retryAfter
      );
    }
    if (failure.code === 'invalid_client' || failure.code === 'access_denied') {
      // The storefront's IAM client is misconfigured; nothing the buyer can fix.
      console.error(
        'Headless sign-in rejected by IAM:',
        failure.code,
        failure.message
      );
    }
    return error(
      503,
      'unavailable',
      'Sign-in is temporarily unavailable',
      setCookies,
      failure.retryAfter
    );
  }
  if (failure instanceof IamOAuthError && failure.status === 429) {
    return error(
      429,
      'rateLimited',
      'Too many sign-in attempts',
      setCookies,
      failure.retryAfter
    );
  }
  if (failure instanceof IamOAuthError && isRejectedGrant(failure)) {
    return error(
      400,
      'expired',
      'The sign-in could not be completed',
      setCookies
    );
  }
  console.error('Headless sign-in failed:', failure);
  return error(
    503,
    'unavailable',
    'Sign-in is temporarily unavailable',
    setCookies
  );
}

function readEndUser(
  request: Request,
  session: StorefrontSessionServer
): EndUser | null {
  const ip = endUserIp(request, session.config.trustedProxyHops);
  if (!ip) return null;
  return { ip, userAgent: request.headers.get('user-agent') ?? undefined };
}

let reportedUnknownEndUser = false;

/** IAM requires the buyer address; without it the storefront's proxy is misconfigured. */
function unknownEndUser(): Response {
  if (!reportedUnknownEndUser) {
    reportedUnknownEndUser = true;
    console.error(
      'Headless sign-in needs the buyer address: the storefront proxy must set X-Forwarded-For'
    );
  }
  return error(503, 'unavailable', 'Sign-in is temporarily unavailable');
}

/** `__Host-` needs HTTPS; a local HTTP storefront uses the plain name. */
function headlessCookieName(session: StorefrontSessionServer): string {
  return session.secure ? '__Host-shopana_auth_htx' : 'shopana_auth_htx';
}

function strings(input: Record<string, unknown>, keys: string[]): boolean {
  return keys.every(
    (key) => typeof input[key] === 'string' && input[key] !== ''
  );
}

function optionalString(value: unknown): boolean {
  return value === undefined || value === null || typeof value === 'string';
}

function error(
  status: number,
  code: AuthErrorCode,
  message: string,
  setCookies: string[] = [],
  retryAfter?: number
): Response {
  const body: AuthErrorBody = {
    error: code,
    message,
    ...(retryAfter !== undefined ? { retryAfter } : {}),
  };
  const response = json(status, body, setCookies);
  if (retryAfter !== undefined)
    response.headers.set('Retry-After', String(retryAfter));
  return response;
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
