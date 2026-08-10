import { applicationAuthPage } from './application-auth-page.js';
import { createApplicationAuthStore } from './application-auth-store.js';

const routePattern =
  /^\/auth\/applications\/([a-zA-Z0-9-]+)\/(sign-up\/email|sign-in\/email|sign-out|list-sessions|revoke-session)$/;
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

export const createApplicationAuthRoutes = () => {
  const store = createApplicationAuthStore();

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

    const [, applicationId, operation] = match;
    const currentToken = parseCookies(request.headers.cookie)[
      cookieName(applicationId)
    ];

    try {
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
          allow: operation === 'list-sessions' ? 'GET' : 'POST',
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
