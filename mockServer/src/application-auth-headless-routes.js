import { randomBytes } from 'node:crypto';

import {
  mockAuthErrorPage,
  mockEmailVerifiedPage,
  mockSocialProviderPage,
} from './mock-social-provider-page.js';

/**
 * Mock of the IAM headless API (`/auth/applications/{id}/headless/v1/*`, contract k4hd) for the
 * storefront's own sign-in forms. Every method of the contract is enabled: password, email
 * code, phone code and social sign-in (Google, Facebook, Apple through a mock provider page),
 * password reset, email verification and account connections. Codes are always `000000`;
 * codes and links are printed to the console instead of being delivered.
 *
 * Email verification is set by `MOCK_IAM_EMAIL_VERIFICATION` (`off` by default, `otp` or
 * `link`): when required, password sign-up and sign-in of an unverified email answer
 * `verification_required`.
 *
 * Like IAM, the API routes answer only server requests: any `Origin` is refused, the client
 * authenticates with Basic and forwards the buyer address. The browser routes (launch URLs,
 * provider page, email links) are opened by the buyer's browser and need none of that.
 */

const apiRoutePattern =
  /^\/auth\/applications\/([a-zA-Z0-9-]+)\/headless\/v1\/(configuration|transactions|transactions\/([^/]+)\/(password\/sign-in|password\/sign-up|password\/forgot|email-otp\/send|email-otp\/verify|phone-otp\/send|phone-otp\/verify|email-verification\/resend|social\/start)|logout|password\/reset|account\/connections|account\/connections\/link|account\/connections\/unlink)$/;
const browserRoutePattern =
  /^\/auth\/applications\/([a-zA-Z0-9-]+)\/headless\/v1\/(social\/launch|social\/callback|social\/error|password\/reset-link|email-verification\/link|account\/connections\/launch|account\/connections\/return)$/;
const MOCK_OTP = '000000';
const TRANSACTION_TTL_MS = 10 * 60 * 1000;
const LAUNCH_TICKET_TTL_MS = 60 * 1000;
const SOCIAL_PROVIDERS = ['google', 'facebook', 'apple'];
const PHONE_PATTERN = /^\+[1-9][0-9]{6,14}$/;

/** Revision per email verification mode, so a restart in another mode changes the ETag. */
const CONFIGURATION_REVISIONS = { off: 2, otp: 3, link: 4 };

const createConfiguration = (emailVerification) => {
  if (!(emailVerification in CONFIGURATION_REVISIONS)) {
    throw new TypeError(
      `MOCK_IAM_EMAIL_VERIFICATION must be off, otp or link, got "${emailVerification}"`
    );
  }
  return {
    methods: {
      password: {
        signIn: true,
        signUp: true,
        reset: true,
        minLength: 10,
        maxLength: 128,
      },
      emailOtp: { signIn: true, signUp: true, codeLength: 6 },
      phoneOtp: { signIn: true, signUp: true, codeLength: 6 },
      social: SOCIAL_PROVIDERS.map((provider) => ({ provider, signUp: true })),
    },
    emailVerificationRequired: emailVerification !== 'off',
    emailVerificationMethod: emailVerification === 'link' ? 'link' : 'otp',
    defaultLocale: 'en',
    revision: CONFIGURATION_REVISIONS[emailVerification],
  };
};

const sendJson = (response, status, body, headers = {}) => {
  response.writeHead(status, {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
    ...headers,
  });
  response.end(JSON.stringify(body));
};

const sendHtml = (response, status, html) => {
  response.writeHead(status, {
    'cache-control': 'no-store',
    'content-type': 'text/html; charset=utf-8',
  });
  response.end(html);
};

const redirect = (response, location) => {
  response.writeHead(303, { 'cache-control': 'no-store', location }).end();
};

/** `url` with the query parameters added. */
const withParams = (url, params) => {
  const next = new URL(url);
  for (const [name, value] of Object.entries(params)) {
    next.searchParams.set(name, value);
  }
  return next.href;
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
  if (
    typeof authorization !== 'string' ||
    !authorization.startsWith('Basic ')
  ) {
    return null;
  }
  const decoded = Buffer.from(
    authorization.slice(6).trim(),
    'base64'
  ).toString();
  const separator = decoded.indexOf(':');
  if (separator < 0) return null;
  return decodeURIComponent(decoded.slice(0, separator).replace(/\+/g, ' '));
};

const isEmail = (value) =>
  typeof value === 'string' && /^\S+@\S+\.\S+$/.test(value);

const isPhone = (value) =>
  typeof value === 'string' && PHONE_PATTERN.test(value);

const STOREFRONT_URI_MAX_LENGTH = 2048;

/**
 * Like IAM: an http(s) URL without credentials or fragment, on `origin` when given, or null.
 */
const parseStorefrontUri = (value, origin) => {
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (
    (url.protocol !== 'https:' && url.protocol !== 'http:') ||
    url.username ||
    url.password ||
    url.hash ||
    (origin !== undefined && url.origin !== origin) ||
    url.href.length > STOREFRONT_URI_MAX_LENGTH
  ) {
    return null;
  }
  return url;
};

const originOf = (value) => {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const opaqueId = () => randomBytes(24).toString('base64url');

/** Removes and answers a one-time entry; null when unknown or expired. */
const take = (entries, key) => {
  if (typeof key !== 'string') return null;
  const entry = entries.get(key);
  entries.delete(key);
  if (!entry || (entry.expiresAt && entry.expiresAt <= Date.now())) {
    return null;
  }
  return entry;
};

const isSocialProvider = (provider) => SOCIAL_PROVIDERS.includes(provider);

export const createApplicationAuthHeadlessRoutes = (
  store,
  { emailVerification = process.env.MOCK_IAM_EMAIL_VERIFICATION || 'off' } = {}
) => {
  const configuration = createConfiguration(emailVerification);
  /** Transactions by opaque id; every step rotates the id, as IAM does. */
  const transactions = new Map();
  /** One-time social sign-in launch tickets (60 s) and the provider page refs they open. */
  const socialTickets = new Map();
  const socialRefs = new Map();
  /** Social failures waiting for `social/error`. */
  const socialErrors = new Map();
  /** One-time account connection launch tickets (60 s) and their provider page refs. */
  const linkTickets = new Map();
  const linkRefs = new Map();
  /** Refs of emailed links; like IAM's signed refs they outlive the tokens. */
  const resetLinks = new Map();
  const verificationLinks = new Map();

  const issuer = (request, applicationId) =>
    `http://${request.headers.host}/auth/applications/${applicationId}`;
  const headlessUrl = (request, applicationId, path) =>
    `${issuer(request, applicationId)}/headless/v1/${path}`;

  const rotate = (id) => {
    const transaction = transactions.get(id);
    transactions.delete(id);
    if (!transaction || transaction.expiresAt <= Date.now()) return null;
    const next = opaqueId();
    transactions.set(next, transaction);
    return { id: next, transaction };
  };

  const authorizationCode = (applicationId, transaction, session) =>
    store.authorize(applicationId, session.token, {
      client_id: transaction.clientId,
      redirect_uri: transaction.redirectUri,
      resource: transaction.resource,
      scope: transaction.scope,
      nonce: transaction.nonce,
      code_challenge: transaction.codeChallenge,
    }).code;

  const complete = (request, applicationId, transaction, session) => ({
    status: 'completed',
    code: authorizationCode(applicationId, transaction, session),
    state: transaction.state,
    iss: issuer(request, applicationId),
  });

  /** Prints the verification link of an unverified email; nothing for any other email. */
  const sendVerificationLink = (request, applicationId, email, verifyUri) => {
    const token = store.requestEmailVerification(applicationId, email);
    if (!token) return;
    const ref = opaqueId();
    verificationLinks.set(ref, {
      applicationId,
      verifyUri: verifyUri?.href ?? null,
    });
    const link = withParams(
      headlessUrl(request, applicationId, 'email-verification/link'),
      { ref, token }
    );
    console.info(`[mock-iam] email verification link for ${email}: ${link}`);
  };

  /** `verification_required` of an unverified email, after sending the code or the link. */
  const verificationRequired = (
    request,
    response,
    applicationId,
    id,
    email,
    verifyUri
  ) => {
    if (configuration.emailVerificationMethod === 'otp') {
      console.info(
        `[mock-iam] email verification code for ${email}: ${MOCK_OTP}`
      );
    } else {
      sendVerificationLink(request, applicationId, email, verifyUri);
    }
    sendJson(response, 200, {
      status: 'verification_required',
      channel: 'email',
      method: configuration.emailVerificationMethod,
      transaction_id: id,
    });
  };

  /** Optional `verify_uri` on the origin of the transaction: URL, undefined, or null if invalid. */
  const optionalVerifyUri = (input, transaction) =>
    input.verify_uri === undefined
      ? undefined
      : typeof input.verify_uri === 'string'
        ? parseStorefrontUri(
            input.verify_uri,
            originOf(transaction.redirectUri)
          )
        : null;

  /** A step IAM answers as disabled before rotating: the transaction stays usable. */
  const isDisabledStep = (step, input) =>
    step === 'social/start' && !isSocialProvider(input.provider);

  const handleBrowserRoute = (request, response, applicationId, operation) => {
    const query = new URL(request.url ?? '/', 'http://mock.local').searchParams;
    const notUsable = (message) =>
      sendHtml(response, 400, mockAuthErrorPage(message));

    if (operation === 'social/launch') {
      const ticket = take(socialTickets, query.get('ticket'));
      if (!ticket || ticket.applicationId !== applicationId) {
        notUsable('The sign-in link is invalid, expired or already used.');
        return;
      }
      const ref = opaqueId();
      socialRefs.set(ref, ticket);
      sendHtml(
        response,
        200,
        mockSocialProviderPage({
          action: headlessUrl(request, applicationId, 'social/callback'),
          provider: ticket.provider,
          ref,
          purpose: 'sign-in',
          email: `${ticket.provider}.user@example.com`,
        })
      );
      return;
    }

    if (operation === 'social/callback') {
      const entry = take(socialRefs, query.get('ref'));
      if (!entry || entry.applicationId !== applicationId) {
        notUsable('The provider answer is invalid or already used.');
        return;
      }
      const { transaction } = entry;
      const failWith = (error) => {
        const ref = opaqueId();
        socialErrors.set(ref, { applicationId, transaction, error });
        redirect(
          response,
          withParams(headlessUrl(request, applicationId, 'social/error'), {
            ref,
          })
        );
      };
      const decision = query.get('decision');
      if (decision === 'cancel') return failWith('access_denied');
      if (decision === 'not_linked') return failWith('account_not_linked');
      const email = query.get('email');
      if (decision !== 'continue' || !isEmail(email)) {
        return failWith('server_error');
      }
      const { session } = store.signInWithProvider(
        applicationId,
        entry.provider,
        {
          accountId: email.trim().toLowerCase(),
          email,
          name: query.get('name'),
        },
        request
      );
      redirect(
        response,
        withParams(transaction.redirectUri, {
          code: authorizationCode(applicationId, transaction, session),
          state: transaction.state,
          iss: issuer(request, applicationId),
        })
      );
      return;
    }

    if (operation === 'social/error') {
      const entry = take(socialErrors, query.get('ref'));
      if (!entry || entry.applicationId !== applicationId) {
        notUsable('The sign-in answer is invalid or already used.');
        return;
      }
      redirect(
        response,
        withParams(entry.transaction.redirectUri, {
          error: entry.error,
          state: entry.transaction.state,
          iss: issuer(request, applicationId),
        })
      );
      return;
    }

    if (operation === 'password/reset-link') {
      const entry = resetLinks.get(query.get('ref'));
      if (!entry || entry.applicationId !== applicationId) {
        notUsable('The password reset link is invalid.');
        return;
      }
      redirect(
        response,
        withParams(
          entry.resetUri,
          store.isPasswordResetTokenValid(applicationId, entry.token)
            ? { token: entry.token }
            : { error: 'invalid_token' }
        )
      );
      return;
    }

    if (operation === 'email-verification/link') {
      const entry = verificationLinks.get(query.get('ref'));
      if (!entry || entry.applicationId !== applicationId) {
        notUsable('The email verification link is invalid.');
        return;
      }
      const token = query.get('token');
      const verified =
        Boolean(token) && store.verifyEmail(applicationId, token);
      if (!entry.verifyUri) {
        sendHtml(response, 200, mockEmailVerifiedPage(verified));
        return;
      }
      redirect(
        response,
        withParams(
          entry.verifyUri,
          verified ? { email_verified: 'true' } : { error: 'invalid_token' }
        )
      );
      return;
    }

    if (operation === 'account/connections/launch') {
      const ticket = take(linkTickets, query.get('ticket'));
      if (!ticket || ticket.applicationId !== applicationId) {
        notUsable('The connection link is invalid, expired or already used.');
        return;
      }
      const ref = opaqueId();
      linkRefs.set(ref, ticket);
      sendHtml(
        response,
        200,
        mockSocialProviderPage({
          action: headlessUrl(
            request,
            applicationId,
            'account/connections/return'
          ),
          provider: ticket.provider,
          ref,
          purpose: 'link',
          email: `${ticket.provider}.user@example.com`,
        })
      );
      return;
    }

    // account/connections/return
    const entry = take(linkRefs, query.get('ref'));
    if (!entry || entry.applicationId !== applicationId) {
      notUsable('The provider answer is invalid or already used.');
      return;
    }
    const providerError =
      query.get('error') ??
      (query.get('decision') === 'cancel' ? 'access_denied' : null);
    const email = query.get('email');
    const outcome = providerError
      ? 'access_denied'
      : isEmail(email)
        ? store.linkProviderAccount(
            applicationId,
            entry.userId,
            entry.provider,
            {
              accountId: email.trim().toLowerCase(),
              email,
            }
          )
        : 'linking_failed';
    redirect(
      response,
      withParams(entry.returnUri, {
        provider: entry.provider,
        ...(outcome === 'linked'
          ? { connection: 'linked' }
          : { connection_error: outcome }),
      })
    );
  };

  const connectionsOf = (applicationId, accessToken) => {
    const connected = store.accountConnections(applicationId, accessToken);
    if (!connected) return null;
    return {
      providers: SOCIAL_PROVIDERS.map((provider) => {
        const count = connected.filter((name) => name === provider).length;
        return {
          provider,
          enabled: true,
          status:
            count > 1 ? 'conflict' : count ? 'connected' : 'not_connected',
        };
      }),
      reauthentication_required: false,
    };
  };

  const handleAccountConnections = async (
    request,
    response,
    applicationId,
    operation
  ) => {
    const token = request.headers['shopana-end-user-access-token'];
    const connections =
      typeof token === 'string' ? connectionsOf(applicationId, token) : null;
    if (!connections) {
      fail(response, 401, 'invalid_token', 'End-user access token is invalid');
      return;
    }
    if (operation === 'account/connections') {
      if (request.method !== 'GET') {
        response.writeHead(405, { allow: 'GET' }).end();
        return;
      }
      sendJson(response, 200, connections);
      return;
    }
    if (request.method !== 'POST') {
      response.writeHead(405, { allow: 'POST' }).end();
      return;
    }
    const input = await readJson(request);
    if (!isSocialProvider(input.provider)) {
      fail(response, 404, 'not_found', 'Provider is disabled');
      return;
    }

    if (operation === 'account/connections/link') {
      const returnUri =
        typeof input.return_uri === 'string'
          ? parseStorefrontUri(input.return_uri)
          : null;
      if (!returnUri) {
        fail(response, 400, 'invalid_request', 'Return URI is invalid');
        return;
      }
      const ticket = opaqueId();
      linkTickets.set(ticket, {
        applicationId,
        userId: store.userIdOfAccessToken(applicationId, token),
        provider: input.provider,
        returnUri: returnUri.href,
        expiresAt: Date.now() + LAUNCH_TICKET_TTL_MS,
      });
      sendJson(response, 200, {
        status: 'redirect',
        url: withParams(
          headlessUrl(request, applicationId, 'account/connections/launch'),
          { ticket }
        ),
      });
      return;
    }

    // account/connections/unlink
    const result = store.unlinkProviderAccount(
      applicationId,
      token,
      input.provider,
      {
        emailOtp: configuration.methods.emailOtp.signIn,
        phoneOtp: configuration.methods.phoneOtp.signIn,
      }
    );
    if (result === 'unlinked') {
      sendJson(response, 200, { status: 'unlinked' });
    } else if (result === 'last_login_method') {
      fail(
        response,
        400,
        'last_login_method',
        'The last way to sign in cannot be removed'
      );
    } else if (result === 'account_conflict') {
      fail(response, 409, 'account_conflict', 'Provider is connected twice');
    } else if (result === 'invalid_token') {
      fail(response, 401, 'invalid_token', 'End-user access token is invalid');
    } else {
      fail(response, 400, 'invalid_request', 'Provider is not connected');
    }
  };

  return async (request, response, pathname) => {
    const browserMatch = pathname.match(browserRoutePattern);
    if (browserMatch) {
      if (request.method !== 'GET') {
        response.writeHead(405, { allow: 'GET' }).end();
        return true;
      }
      try {
        handleBrowserRoute(request, response, browserMatch[1], browserMatch[2]);
      } catch (error) {
        console.error('[mock-iam] headless browser route failed:', error);
        sendHtml(
          response,
          500,
          mockAuthErrorPage('The mock IAM could not complete the request.')
        );
      }
      return true;
    }

    const match = pathname.match(apiRoutePattern);
    if (!match) return false;
    const [, applicationId, operation, transactionId, step] = match;

    if (request.headers.origin) {
      fail(
        response,
        403,
        'access_denied',
        'Headless API is server-to-server only'
      );
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
        if (
          request.headers['if-none-match'] === `"${configuration.revision}"`
        ) {
          response
            .writeHead(304, { etag: `"${configuration.revision}"` })
            .end();
          return true;
        }
        sendJson(response, 200, configuration, {
          etag: `"${configuration.revision}"`,
        });
        return true;
      }

      if (operation === 'logout' && request.method === 'POST') {
        const input = await readJson(request);
        if (input.refresh_token) store.revokeOAuthToken(input.refresh_token);
        sendJson(response, 200, { status: 'logged_out' });
        return true;
      }

      if (operation === 'password/reset' && request.method === 'POST') {
        const input = await readJson(request);
        if (typeof input.password !== 'string' || input.password.length < 10) {
          fail(response, 400, 'invalid_request', 'Password is invalid');
          return true;
        }
        if (!store.resetPassword(applicationId, input.token, input.password)) {
          fail(
            response,
            400,
            'invalid_grant',
            'Reset token is invalid or expired'
          );
          return true;
        }
        sendJson(response, 200, { status: 'password_reset' });
        return true;
      }

      if (operation.startsWith('account/connections')) {
        await handleAccountConnections(
          request,
          response,
          applicationId,
          operation
        );
        return true;
      }

      if (operation === 'transactions' && request.method === 'POST') {
        const input = await readJson(request);
        if (input.code_challenge_method !== 'S256' || !input.code_challenge) {
          fail(response, 400, 'invalid_request', 'PKCE S256 is required');
          return true;
        }
        if (!parseStorefrontUri(input.redirect_uri)) {
          fail(response, 400, 'invalid_request', 'Redirect URI is invalid');
          return true;
        }
        const id = opaqueId();
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
      if (isDisabledStep(step, input)) {
        fail(response, 404, 'not_found', 'Method is disabled');
        return true;
      }
      const rotated = rotate(transactionId);
      if (!rotated) {
        fail(response, 400, 'transaction_expired', 'Transaction expired');
        return true;
      }
      const { id, transaction } = rotated;
      const requireVerifiedEmail = configuration.emailVerificationRequired;

      if (step === 'password/sign-in') {
        const verifyUri = optionalVerifyUri(input, transaction);
        if (verifyUri === null) {
          fail(response, 400, 'invalid_request', 'Verify URI is invalid', id);
          return true;
        }
        const result = isEmail(input.email)
          ? store.signIn(applicationId, input, request, {
              requireVerifiedEmail,
            })
          : { error: 'invalid_credentials' };
        if (result.error === 'email_not_verified') {
          verificationRequired(
            request,
            response,
            applicationId,
            id,
            input.email,
            verifyUri
          );
          return true;
        }
        if (result.error) {
          fail(response, 400, 'invalid_grant', 'Invalid credentials', id);
          return true;
        }
        sendJson(
          response,
          200,
          complete(request, applicationId, transaction, result.session)
        );
        return true;
      }

      if (step === 'password/sign-up') {
        const verifyUri = optionalVerifyUri(input, transaction);
        if (
          !isEmail(input.email) ||
          typeof input.password !== 'string' ||
          input.password.length < 10 ||
          typeof input.firstName !== 'string' ||
          !input.firstName.trim() ||
          verifyUri === null
        ) {
          fail(response, 400, 'invalid_request', 'Invalid sign-up input', id);
          return true;
        }
        const name = [input.firstName, input.lastName]
          .filter(Boolean)
          .join(' ');
        const result = store.signUp(
          applicationId,
          { ...input, name },
          request,
          { requireVerifiedEmail }
        );
        if (result.error === 'email_not_verified') {
          verificationRequired(
            request,
            response,
            applicationId,
            id,
            input.email,
            verifyUri
          );
          return true;
        }
        if (result.error) {
          fail(response, 409, 'user_exists', 'User already exists', id);
          return true;
        }
        sendJson(
          response,
          200,
          complete(request, applicationId, transaction, result.session)
        );
        return true;
      }

      if (step === 'email-otp/send') {
        if (!isEmail(input.email)) {
          fail(
            response,
            400,
            'invalid_request',
            'A valid email is required',
            id
          );
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
        const result = store.signInWithEmailCode(
          applicationId,
          input.email,
          request
        );
        sendJson(
          response,
          200,
          complete(request, applicationId, transaction, result.session)
        );
        return true;
      }

      if (step === 'phone-otp/send') {
        if (!isPhone(input.phoneNumber)) {
          fail(
            response,
            400,
            'invalid_request',
            'A phone number in E.164 format is required',
            id
          );
          return true;
        }
        console.info(
          `[mock-iam] phone code for ${input.phoneNumber}: ${MOCK_OTP}`
        );
        sendJson(response, 200, {
          status: 'otp_sent',
          channel: 'phone',
          resend_after: 60,
          expires_in: 300,
          transaction_id: id,
        });
        return true;
      }

      if (step === 'phone-otp/verify') {
        if (!isPhone(input.phoneNumber)) {
          fail(
            response,
            400,
            'invalid_request',
            'A phone number in E.164 format is required',
            id
          );
          return true;
        }
        if (input.code !== MOCK_OTP) {
          fail(response, 400, 'invalid_grant', 'Invalid code', id);
          return true;
        }
        const result = store.signInWithPhoneCode(
          applicationId,
          input.phoneNumber,
          request
        );
        sendJson(
          response,
          200,
          complete(request, applicationId, transaction, result.session)
        );
        return true;
      }

      if (step === 'social/start') {
        // The launch consumes the transaction: it leaves the step chain for the ticket.
        transactions.delete(id);
        const ticket = opaqueId();
        socialTickets.set(ticket, {
          applicationId,
          provider: input.provider,
          transaction,
          expiresAt: Date.now() + LAUNCH_TICKET_TTL_MS,
        });
        sendJson(response, 200, {
          status: 'redirect',
          url: withParams(
            headlessUrl(request, applicationId, 'social/launch'),
            { ticket }
          ),
        });
        return true;
      }

      if (step === 'email-verification/resend') {
        const verifyUri = optionalVerifyUri(input, transaction);
        if (!isEmail(input.email) || verifyUri === null) {
          fail(
            response,
            400,
            'invalid_request',
            'Invalid verification request',
            id
          );
          return true;
        }
        sendVerificationLink(request, applicationId, input.email, verifyUri);
        sendJson(response, 200, {
          status: 'verification_sent',
          transaction_id: id,
        });
        return true;
      }

      // password/forgot
      if (!isEmail(input.email) || typeof input.reset_uri !== 'string') {
        fail(response, 400, 'invalid_request', 'Invalid reset request', id);
        return true;
      }
      const resetUri = parseStorefrontUri(
        input.reset_uri,
        originOf(transaction.redirectUri)
      );
      if (!resetUri) {
        fail(response, 400, 'invalid_request', 'Reset URI is invalid', id);
        return true;
      }
      const token = store.requestPasswordReset(applicationId, input.email);
      if (token) {
        const ref = opaqueId();
        resetLinks.set(ref, { applicationId, token, resetUri: resetUri.href });
        const link = withParams(
          headlessUrl(request, applicationId, 'password/reset-link'),
          { ref }
        );
        console.info(
          `[mock-iam] password reset link for ${input.email}: ${link}`
        );
      }
      sendJson(response, 200, {
        status: 'reset_link_sent',
        transaction_id: id,
      });
      return true;
    } catch (error) {
      if (error instanceof SyntaxError) {
        fail(
          response,
          400,
          'invalid_request',
          'Request body must be valid JSON'
        );
      } else {
        console.error('[mock-iam] headless request failed:', error);
        fail(response, 500, 'server_error', 'Mock IAM failed');
      }
      return true;
    }
  };
};
