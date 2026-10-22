import { randomBytes } from 'node:crypto';

/**
 * Mock of the IAM headless API (`/auth/applications/{id}/headless/v1/*`, contract k4hd) for the
 * storefront's own sign-in forms. Password and email-code sign-in are enabled; the email code
 * is always `000000`. Like IAM, it answers only server requests: any `Origin` is refused.
 */

const routePattern =
  /^\/auth\/applications\/([a-zA-Z0-9-]+)\/headless\/v1\/(configuration|transactions|transactions\/([^/]+)\/(password\/sign-in|password\/sign-up|email-otp\/send|email-otp\/verify|phone-otp\/send|phone-otp\/verify|social\/start)|logout)$/;
const MOCK_OTP = '000000';
const TRANSACTION_TTL_MS = 10 * 60 * 1000;

const configuration = {
  methods: {
    password: { signIn: true, signUp: true, minLength: 10, maxLength: 128 },
    emailOtp: { signIn: true, signUp: true, codeLength: 6 },
    phoneOtp: { signIn: false, signUp: false, codeLength: 6 },
    social: [],
  },
  emailVerificationRequired: false,
  emailVerificationMethod: 'otp',
  defaultLocale: 'en',
  revision: 1,
};

const sendJson = (response, status, body, headers = {}) => {
  response.writeHead(status, {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
    ...headers,
  });
  response.end(JSON.stringify(body));
};

const fail = (response, status, error, description, transactionId) =>
  sendJson(response, status, {
    error,
    error_description: description,
    ...(transactionId ? { transaction_id: transactionId } : {}),
  });

const readJson = async (request) => {
  let body = '';
  for await (const chunk of request) body += chunk;
  return body ? JSON.parse(body) : {};
};

const basicClientId = (request) => {
  const authorization = request.headers.authorization;
  if (typeof authorization !== 'string' || !authorization.startsWith('Basic ')) {
    return null;
  }
  const decoded = Buffer.from(authorization.slice(6).trim(), 'base64').toString();
  const separator = decoded.indexOf(':');
  if (separator < 0) return null;
  return decodeURIComponent(decoded.slice(0, separator).replace(/\+/g, ' '));
};

const isEmail = (value) =>
  typeof value === 'string' && /^\S+@\S+\.\S+$/.test(value);

export const createApplicationAuthHeadlessRoutes = (store) => {
  /** Transactions by opaque id; every step rotates the id, as IAM does. */
  const transactions = new Map();

  const rotate = (id) => {
    const transaction = transactions.get(id);
    transactions.delete(id);
    if (!transaction || transaction.expiresAt <= Date.now()) return null;
    const next = randomBytes(24).toString('base64url');
    transactions.set(next, transaction);
    return { id: next, transaction };
  };

  const complete = (request, applicationId, transaction, session) => {
    const { code } = store.authorize(applicationId, session.token, {
      client_id: transaction.clientId,
      redirect_uri: transaction.redirectUri,
      resource: transaction.resource,
      scope: transaction.scope,
      nonce: transaction.nonce,
      code_challenge: transaction.codeChallenge,
    });
    return {
      status: 'completed',
      code,
      state: transaction.state,
      iss: `http://${request.headers.host}/auth/applications/${applicationId}`,
    };
  };

  return async (request, response, pathname) => {
    const match = pathname.match(routePattern);
    if (!match) return false;
    const [, applicationId, operation, transactionId, step] = match;

    if (request.headers.origin) {
      fail(response, 403, 'access_denied', 'Headless API is server-to-server only');
      return true;
    }
    const clientId = basicClientId(request);
    if (!clientId) {
      fail(response, 401, 'invalid_client', 'Client authentication failed');
      return true;
    }
    if (!request.headers['shopana-end-user-ip']) {
      fail(response, 400, 'invalid_request', 'shopana-end-user-ip is required');
      return true;
    }

    try {
      if (operation === 'configuration' && request.method === 'GET') {
        if (request.headers['if-none-match'] === `"${configuration.revision}"`) {
          response.writeHead(304, { etag: `"${configuration.revision}"` }).end();
          return true;
        }
        sendJson(response, 200, configuration, { etag: `"${configuration.revision}"` });
        return true;
      }

      if (operation === 'logout' && request.method === 'POST') {
        const input = await readJson(request);
        if (input.refresh_token) store.revokeOAuthToken(input.refresh_token);
        sendJson(response, 200, { status: 'logged_out' });
        return true;
      }

      if (operation === 'transactions' && request.method === 'POST') {
        const input = await readJson(request);
        if (input.code_challenge_method !== 'S256' || !input.code_challenge) {
          fail(response, 400, 'invalid_request', 'PKCE S256 is required');
          return true;
        }
        const id = randomBytes(24).toString('base64url');
        transactions.set(id, {
          clientId,
          redirectUri: input.redirect_uri,
          resource: input.resource,
          scope: input.scope,
          state: input.state,
          nonce: input.nonce,
          codeChallenge: input.code_challenge,
          expiresAt: Date.now() + TRANSACTION_TTL_MS,
        });
        sendJson(response, 201, { transaction_id: id, expires_in: 600 });
        return true;
      }

      if (!step || request.method !== 'POST') {
        response.writeHead(405, { allow: 'POST' }).end();
        return true;
      }

      const input = await readJson(request);
      const rotated = rotate(transactionId);
      if (!rotated) {
        fail(response, 400, 'transaction_expired', 'Transaction expired');
        return true;
      }
      const { id, transaction } = rotated;

      if (step === 'password/sign-in') {
        const result = isEmail(input.email)
          ? store.signIn(applicationId, input, request)
          : { error: 'invalid_credentials' };
        if (result.error) {
          fail(response, 400, 'invalid_grant', 'Invalid credentials', id);
          return true;
        }
        sendJson(response, 200, complete(request, applicationId, transaction, result.session));
        return true;
      }

      if (step === 'password/sign-up') {
        if (
          !isEmail(input.email) ||
          typeof input.password !== 'string' ||
          input.password.length < 10 ||
          typeof input.firstName !== 'string' ||
          !input.firstName.trim()
        ) {
          fail(response, 400, 'invalid_request', 'Invalid sign-up input', id);
          return true;
        }
        const name = [input.firstName, input.lastName].filter(Boolean).join(' ');
        const result = store.signUp(applicationId, { ...input, name }, request);
        if (result.error) {
          fail(response, 409, 'user_exists', 'User already exists', id);
          return true;
        }
        sendJson(response, 200, complete(request, applicationId, transaction, result.session));
        return true;
      }

      if (step === 'email-otp/send') {
        if (!isEmail(input.email)) {
          fail(response, 400, 'invalid_request', 'A valid email is required', id);
          return true;
        }
        console.info(`[mock-iam] email code for ${input.email}: ${MOCK_OTP}`);
        sendJson(response, 200, {
          status: 'otp_sent',
          channel: 'email',
          resend_after: 60,
          expires_in: 300,
          transaction_id: id,
        });
        return true;
      }

      if (step === 'email-otp/verify') {
        if (!isEmail(input.email) || input.otp !== MOCK_OTP) {
          fail(response, 400, 'invalid_grant', 'Invalid code', id);
          return true;
        }
        const result = store.signInWithEmailCode(applicationId, input.email, request);
        sendJson(response, 200, complete(request, applicationId, transaction, result.session));
        return true;
      }

      // Phone codes and social providers are disabled in the mock configuration.
      fail(response, 404, 'not_found', 'Method is disabled');
      return true;
    } catch {
      fail(response, 400, 'invalid_request', 'Request body must be valid JSON');
      return true;
    }
  };
};
