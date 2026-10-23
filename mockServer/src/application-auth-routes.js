import { applicationAuthPage } from './application-auth-page.js';
import { oauthAuthorizationPage } from './oauth-authorization-page.js';

const routePattern =
  /^\/auth\/applications\/([a-zA-Z0-9-]+)\/(sign-up\/email|sign-in\/email|sign-out|request-password-reset|reset-password|list-sessions|revoke-session|oauth2\/authorize|oauth2\/token|oauth2\/userinfo|oauth2\/revoke)$/;
const maxBodySize = 1024 * 1024;

const cookieName = (applicationId) =>
  `shopana_application_${applicationId}.session_token`;

const parseCookies = (header = '') =>
  Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim().split('='))
      .filter(([name, value]) => name && value)
      .map(([name, ...value]) => [name, decodeURIComponent(value.join('='))])
  );

const readJson = async (request) => {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > maxBodySize) throw new Error('request_too_large');
  }
  if (!body) return {};
  return JSON.parse(body);
};

const readInput = async (request) => {
  const contentType = request.headers['content-type'] ?? '';
  if (!contentType.includes('application/x-www-form-urlencoded')) {
    return readJson(request);
  }
  let body = '';
  for await (const chunk of request) body += chunk;
  return Object.fromEntries(new URLSearchParams(body));
};

/**
 * OAuth client input of the token and revoke endpoints. A confidential client (the storefront
 * session server) authenticates with `client_secret_basic`; the mock accepts any secret.
 */
const readClientInput = async (request) => {
  const input = await readInput(request);
  const authorization = request.headers.authorization;
  if (
    typeof authorization !== 'string' ||
    !authorization.startsWith('Basic ')
  ) {
    return input;
  }
  const decoded = Buffer.from(
    authorization.slice(6).trim(),
    'base64'
  ).toString();
  const separator = decoded.indexOf(':');
  const clientId = decodeURIComponent(
    (separator < 0 ? decoded : decoded.slice(0, separator)).replace(/\+/g, ' ')
  );
  if (input.client_id && input.client_id !== clientId) {
    return { ...input, client_id: undefined, invalid_client: true };
  }
  return { ...input, client_id: clientId };
};

const sendJson = (response, status, body, headers = {}) => {
  response.writeHead(status, {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
    ...headers,
  });
  response.end(JSON.stringify(body));
};

const sessionCookie = (applicationId, token, rememberMe) => {
  const attributes = [
    `${cookieName(applicationId)}=${encodeURIComponent(token)}`,
    `Path=/auth/applications/${applicationId}`,
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (rememberMe) attributes.push(`Max-Age=${30 * 24 * 60 * 60}`);
  return attributes.join('; ');
};

const expiredCookie = (applicationId) =>
  `${cookieName(applicationId)}=; Path=/auth/applications/${applicationId}; HttpOnly; SameSite=Lax; Max-Age=0`;

const setCorsHeaders = (request, response) => {
  const origin = request.headers.origin;
  if (!origin) return;
  response.setHeader('access-control-allow-origin', origin);
  response.setHeader('access-control-allow-credentials', 'true');
  response.setHeader(
    'access-control-allow-headers',
    request.headers['access-control-request-headers'] ??
      'content-type, authorization'
  );
  response.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS');
  response.setHeader('vary', 'Origin');
};

const validateAccountInput = (input, { signUp = false } = {}) => {
  if (signUp && (typeof input.name !== 'string' || !input.name.trim())) {
    return 'Name is required';
  }
  if (typeof input.email !== 'string' || !/^\S+@\S+\.\S+$/.test(input.email)) {
    return 'A valid email is required';
  }
  if (
    typeof input.password !== 'string' ||
    input.password.length < (signUp ? 10 : 1)
  ) {
    return signUp
      ? 'Password must contain at least 10 characters'
      : 'Password is required';
  }
  return null;
};

export const createApplicationAuthRoutes = (store) => {
  return async (request, response, pathname) => {
    if (
      request.method === 'GET' &&
      (pathname === '/auth' || pathname === '/auth/')
    ) {
      response.writeHead(200, {
        'cache-control': 'no-store',
        'content-type': 'text/html; charset=utf-8',
      });
      response.end(applicationAuthPage);
      return true;
    }

    const match = pathname.match(routePattern);
    if (!match) return false;

    setCorsHeaders(request, response);
    if (request.method === 'OPTIONS') {
      response.writeHead(204).end();
      return true;
    }

    const [, applicationId, operation] = match;
    const authorization = request.headers.authorization;
    const authorizationToken =
      typeof authorization === 'string' && authorization.startsWith('Bearer ')
        ? authorization.slice(7).trim()
        : null;
    const currentToken =
      parseCookies(request.headers.cookie)[cookieName(applicationId)] ??
      authorizationToken;

    try {
      if (operation === 'oauth2/authorize' && request.method === 'GET') {
        const url = new URL(request.url ?? '/', 'http://mock.local');
        const input = Object.fromEntries(url.searchParams);
        const redirect = new URL(input.redirect_uri);
        const result = store.authorize(applicationId, currentToken, input);
        if (result.error === 'login_required' && input.prompt !== 'none') {
          response.writeHead(200, {
            'cache-control': 'no-store',
            'content-type': 'text/html; charset=utf-8',
          });
          response.end(oauthAuthorizationPage);
          return true;
        }
        if (result.error) {
          redirect.searchParams.set('error', result.error);
        } else {
          redirect.searchParams.set('code', result.code);
        }
        if (input.state) redirect.searchParams.set('state', input.state);
        response.writeHead(302, {
          'cache-control': 'no-store',
          location: redirect.href,
        });
        response.end();
        return true;
      }

      if (operation === 'oauth2/token' && request.method === 'POST') {
        const input = await readClientInput(request);
        if (input.invalid_client) {
          sendJson(response, 401, { error: 'invalid_client' });
          return true;
        }
        const result =
          input.grant_type === 'refresh_token'
            ? store.refreshOAuthToken(applicationId, input)
            : store.exchangeAuthorizationCode(applicationId, input);
        if (result.error) {
          sendJson(response, 400, {
            error: result.error,
            error_description: 'OAuth grant is invalid or expired',
          });
          return true;
        }
        sendJson(response, 200, result);
        return true;
      }

      if (operation === 'oauth2/userinfo' && request.method === 'GET') {
        const user = store.userInfo(applicationId, authorizationToken);
        if (!user) {
          sendJson(response, 401, { error: 'invalid_token' });
          return true;
        }
        sendJson(response, 200, user);
        return true;
      }

      if (operation === 'oauth2/revoke' && request.method === 'POST') {
        const input = await readClientInput(request);
        if (input.token) store.revokeOAuthToken(input.token);
        sendJson(response, 200, {});
        return true;
      }

      if (operation === 'sign-up/email' && request.method === 'POST') {
        const input = await readJson(request);
        const validationError = validateAccountInput(input, { signUp: true });
        if (validationError) {
          sendJson(response, 400, {
            error: 'invalid_signup',
            error_description: validationError,
          });
          return true;
        }
        const result = store.signUp(applicationId, input, request);
        if (result.error) {
          sendJson(response, 422, {
            error: 'invalid_signup',
            error_description: 'User already exists',
          });
          return true;
        }
        sendJson(
          response,
          200,
          {
            token: result.session.token,
            redirect: false,
            url: null,
            user: result.user,
          },
          {
            'set-cookie': sessionCookie(
              applicationId,
              result.session.token,
              input.rememberMe !== false
            ),
          }
        );
        return true;
      }

      if (operation === 'sign-in/email' && request.method === 'POST') {
        const input = await readJson(request);
        const validationError = validateAccountInput(input);
        if (validationError) {
          sendJson(response, 400, {
            error: 'invalid_request',
            error_description: validationError,
          });
          return true;
        }
        const result = store.signIn(applicationId, input, request);
        if (result.error) {
          sendJson(response, 401, {
            error: 'invalid_credentials',
            error_description: 'Email or password is invalid',
          });
          return true;
        }
        sendJson(
          response,
          200,
          {
            token: result.session.token,
            redirect: false,
            url: null,
            user: result.user,
          },
          {
            'set-cookie': sessionCookie(
              applicationId,
              result.session.token,
              input.rememberMe !== false
            ),
          }
        );
        return true;
      }

      if (operation === 'request-password-reset' && request.method === 'POST') {
        const input = await readJson(request);
        if (
          typeof input.email !== 'string' ||
          !/^\S+@\S+\.\S+$/.test(input.email)
        ) {
          sendJson(response, 400, {
            error: 'invalid_request',
            error_description: 'A valid email is required',
          });
          return true;
        }
        store.requestPasswordReset(applicationId, input.email);
        sendJson(response, 202, {
          status: true,
          message: 'If the account exists, a password reset was requested',
        });
        return true;
      }

      if (operation === 'reset-password' && request.method === 'POST') {
        const input = await readJson(request);
        if (
          typeof input.token !== 'string' ||
          !input.token ||
          typeof input.newPassword !== 'string' ||
          input.newPassword.length < 10
        ) {
          sendJson(response, 400, {
            error: 'invalid_request',
            error_description:
              'A reset token and a password of at least 10 characters are required',
          });
          return true;
        }
        const status = store.resetPassword(
          applicationId,
          input.token,
          input.newPassword
        );
        if (!status) {
          sendJson(response, 400, {
            error: 'invalid_token',
            error_description: 'Password reset token is invalid or expired',
          });
          return true;
        }
        sendJson(response, 200, { status: true });
        return true;
      }

      if (operation === 'sign-out' && request.method === 'POST') {
        store.signOut(applicationId, currentToken);
        sendJson(
          response,
          200,
          { success: true },
          { 'set-cookie': expiredCookie(applicationId) }
        );
        return true;
      }

      if (operation === 'list-sessions' && request.method === 'GET') {
        const sessions = store.listSessions(applicationId, currentToken);
        if (!sessions) {
          sendJson(response, 401, {
            error: 'unauthorized',
            error_description: 'An application session is required',
          });
          return true;
        }
        sendJson(response, 200, sessions);
        return true;
      }

      if (operation === 'revoke-session' && request.method === 'POST') {
        const input = await readJson(request);
        if (typeof input.token !== 'string' || !input.token) {
          sendJson(response, 400, {
            error: 'invalid_request',
            error_description: 'Session token is required',
          });
          return true;
        }
        const status = store.revokeSession(
          applicationId,
          currentToken,
          input.token
        );
        if (status === null) {
          sendJson(response, 401, {
            error: 'unauthorized',
            error_description: 'An application session is required',
          });
          return true;
        }
        const headers =
          input.token === currentToken && status
            ? { 'set-cookie': expiredCookie(applicationId) }
            : {};
        sendJson(response, 200, { status }, headers);
        return true;
      }

      response
        .writeHead(405, {
          allow:
            operation === 'list-sessions' ||
            operation === 'oauth2/authorize' ||
            operation === 'oauth2/userinfo'
              ? 'GET'
              : 'POST',
        })
        .end();
      return true;
    } catch (error) {
      const message =
        error instanceof SyntaxError
          ? 'Request body must be valid JSON'
          : error.message === 'request_too_large'
            ? 'Request body is too large'
            : 'Mock auth request failed';
      sendJson(response, error.message === 'request_too_large' ? 413 : 400, {
        error: 'invalid_request',
        error_description: message,
      });
      return true;
    }
  };
};
