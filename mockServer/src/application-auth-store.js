import { createHash, randomBytes, randomUUID } from 'node:crypto';

const normalizeEmail = (email) => email.trim().toLowerCase();
const publicUser = (user) => ({
  id: user.id,
  applicationId: user.applicationId,
  email: user.email,
  emailVerified: user.emailVerified,
  name: user.name,
  firstName: user.firstName,
  lastName: user.lastName,
  image: user.image,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const createApplicationAuthStore = ({
  customerStore,
  fixturePassword = 'password123',
  now = () => new Date(),
} = {}) => {
  const usersByRealm = new Map();
  const sessionsByToken = new Map();
  const customerIdsByUserId = new Map();
  const authorizationCodes = new Map();
  const accessTokens = new Map();
  const refreshTokens = new Map();
  const passwordResetTokens = new Map();

  const revokeOAuthForSession = (applicationSessionId) => {
    for (const [code, grant] of authorizationCodes) {
      if (grant.applicationSessionId === applicationSessionId) {
        authorizationCodes.delete(code);
      }
    }
    for (const [token, grant] of accessTokens) {
      if (grant.applicationSessionId === applicationSessionId) {
        accessTokens.delete(token);
      }
    }
    for (const [token, grant] of refreshTokens) {
      if (grant.applicationSessionId === applicationSessionId) {
        refreshTokens.delete(token);
      }
    }
  };

  const realmUsers = (applicationId) => {
    let users = usersByRealm.get(applicationId);
    if (!users) {
      users = new Map();
      usersByRealm.set(applicationId, users);
    }
    return users;
  };

  const findActiveSession = (applicationId, token) => {
    if (!token) return null;
    const session = sessionsByToken.get(token);
    if (!session || session.applicationId !== applicationId) return null;
    if (new Date(session.expiresAt).getTime() <= now().getTime()) {
      sessionsByToken.delete(token);
      revokeOAuthForSession(session.id);
      return null;
    }
    return session;
  };

  const findActiveSessionById = (applicationId, sessionId) => {
    const session = [...sessionsByToken.values()].find(
      (candidate) =>
        candidate.applicationId === applicationId && candidate.id === sessionId
    );
    return session ? findActiveSession(applicationId, session.token) : null;
  };

  const createSession = (applicationId, user, request, rememberMe) => {
    const createdAt = now();
    const expiresAt = new Date(
      createdAt.getTime() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000
    );
    const token = randomBytes(32).toString('base64url');
    const session = {
      id: randomUUID(),
      applicationId,
      token,
      userId: user.id,
      expiresAt: expiresAt.toISOString(),
      ipAddress: request.socket.remoteAddress ?? null,
      userAgent: request.headers['user-agent'] ?? null,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    };
    sessionsByToken.set(token, session);
    return session;
  };

  const linkCustomer = (user) => {
    const customer = customerStore?.provisionCustomer(user) ?? null;
    if (customer) customerIdsByUserId.set(user.id, customer.id);
    return customer;
  };

  const seedFixtureUser = (applicationId, email, password) => {
    if (password !== fixturePassword) return null;
    const customer = customerStore?.customerByEmail(email);
    if (!customer) return null;

    const timestamp = now().toISOString();
    const user = {
      id: randomUUID(),
      applicationId,
      email: normalizeEmail(email),
      emailVerified: true,
      name: customer.displayName,
      firstName: customer.firstName || null,
      lastName: customer.lastName || null,
      image: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      password: fixturePassword,
    };
    realmUsers(applicationId).set(user.email, user);
    customerIdsByUserId.set(user.id, customer.id);
    return user;
  };

  return {
    signUp(applicationId, input, request) {
      const email = normalizeEmail(input.email);
      const users = realmUsers(applicationId);
      if (users.has(email)) return { error: 'email_already_exists' };

      const timestamp = now().toISOString();
      const user = {
        id: randomUUID(),
        applicationId,
        email,
        emailVerified: false,
        name: input.name.trim(),
        firstName: input.firstName?.trim() || null,
        lastName: input.lastName?.trim() || null,
        image: input.image || null,
        createdAt: timestamp,
        updatedAt: timestamp,
        password: input.password,
      };
      users.set(email, user);
      linkCustomer(user);
      const session = createSession(
        applicationId,
        user,
        request,
        input.rememberMe !== false
      );
      return { session, user: publicUser(user) };
    },

    signIn(applicationId, input, request) {
      const email = normalizeEmail(input.email);
      const user =
        realmUsers(applicationId).get(email) ??
        seedFixtureUser(applicationId, email, input.password);
      if (!user || user.password !== input.password) {
        return { error: 'invalid_credentials' };
      }
      const session = createSession(
        applicationId,
        user,
        request,
        input.rememberMe !== false
      );
      return { session, user: publicUser(user) };
    },

    requestPasswordReset(applicationId, email) {
      const user = realmUsers(applicationId).get(normalizeEmail(email));
      if (!user) return null;
      const token = randomBytes(32).toString('base64url');
      passwordResetTokens.set(token, {
        applicationId,
        userId: user.id,
        expiresAt: now().getTime() + 60 * 60 * 1000,
      });
      return token;
    },

    resetPassword(applicationId, token, newPassword) {
      const reset = passwordResetTokens.get(token);
      passwordResetTokens.delete(token);
      if (
        !reset ||
        reset.applicationId !== applicationId ||
        reset.expiresAt <= now().getTime()
      ) {
        return false;
      }
      const user = [...realmUsers(applicationId).values()].find(
        (candidate) => candidate.id === reset.userId
      );
      if (!user) return false;
      user.password = newPassword;
      user.updatedAt = now().toISOString();
      for (const [sessionToken, session] of sessionsByToken) {
        if (
          session.applicationId === applicationId &&
          session.userId === user.id
        ) {
          sessionsByToken.delete(sessionToken);
          revokeOAuthForSession(session.id);
        }
      }
      return true;
    },

    authorize(applicationId, sessionToken, input) {
      const session = findActiveSession(applicationId, sessionToken);
      if (!session) return { error: 'login_required' };
      const code = randomBytes(32).toString('base64url');
      authorizationCodes.set(code, {
        applicationId,
        applicationSessionId: session.id,
        userId: session.userId,
        clientId: input.client_id,
        redirectUri: input.redirect_uri,
        resource: input.resource,
        scope: input.scope,
        nonce: input.nonce,
        codeChallenge: input.code_challenge,
        expiresAt: now().getTime() + 5 * 60 * 1000,
      });
      return { code };
    },

    exchangeAuthorizationCode(applicationId, input) {
      const grant = authorizationCodes.get(input.code);
      authorizationCodes.delete(input.code);
      const challenge = createHash('sha256')
        .update(input.code_verifier ?? '')
        .digest('base64url');
      if (
        !grant ||
        grant.expiresAt <= now().getTime() ||
        grant.applicationId !== applicationId ||
        grant.clientId !== input.client_id ||
        grant.redirectUri !== input.redirect_uri ||
        grant.resource !== input.resource ||
        grant.codeChallenge !== challenge ||
        !findActiveSessionById(applicationId, grant.applicationSessionId)
      )
        return { error: 'invalid_grant' };
      return issueOAuthTokens(grant);
    },

    refreshOAuthToken(applicationId, input) {
      const grant = refreshTokens.get(input.refresh_token);
      if (
        !grant ||
        grant.applicationId !== applicationId ||
        grant.clientId !== input.client_id ||
        grant.resource !== input.resource ||
        !findActiveSessionById(applicationId, grant.applicationSessionId)
      )
        return { error: 'invalid_grant' };
      refreshTokens.delete(input.refresh_token);
      return issueOAuthTokens(grant);
    },

    userInfo(applicationId, token) {
      const grant = accessTokens.get(token);
      if (
        !grant ||
        grant.applicationId !== applicationId ||
        grant.expiresAt <= now().getTime() ||
        !findActiveSessionById(applicationId, grant.applicationSessionId)
      )
        return null;
      const user = [...realmUsers(applicationId).values()].find(
        (candidate) => candidate.id === grant.userId
      );
      if (!user) return null;
      return {
        sub: user.id,
        email: user.email,
        email_verified: user.emailVerified,
        name: user.name,
        given_name: user.firstName,
        family_name: user.lastName,
        picture: user.image,
      };
    },

    revokeOAuthToken(token) {
      accessTokens.delete(token);
      refreshTokens.delete(token);
    },

    resolveCustomer(token) {
      const grant = accessTokens.get(token);
      if (
        !grant ||
        grant.expiresAt <= now().getTime() ||
        !findActiveSessionById(grant.applicationId, grant.applicationSessionId)
      )
        return null;
      return customerStore?.get(customerIdsByUserId.get(grant.userId)) ?? null;
    },

    listSessions(applicationId, currentToken) {
      const current = findActiveSession(applicationId, currentToken);
      if (!current) return null;
      return [...sessionsByToken.values()].filter(
        (session) =>
          session.applicationId === applicationId &&
          session.userId === current.userId &&
          findActiveSession(applicationId, session.token)
      );
    },

    revokeSession(applicationId, currentToken, token) {
      const current = findActiveSession(applicationId, currentToken);
      if (!current) return null;
      const target = findActiveSession(applicationId, token);
      if (target && target.userId === current.userId) {
        sessionsByToken.delete(token);
        revokeOAuthForSession(target.id);
      }
      return true;
    },

    signOut(applicationId, currentToken) {
      const current = findActiveSession(applicationId, currentToken);
      if (current) {
        sessionsByToken.delete(current.token);
        revokeOAuthForSession(current.id);
      }
    },
  };

  function issueOAuthTokens(grant) {
    const accessToken = randomBytes(32).toString('base64url');
    const refreshToken = randomBytes(32).toString('base64url');
    const expiresIn = 3600;
    const tokenGrant = {
      ...grant,
      expiresAt: now().getTime() + expiresIn * 1000,
    };
    accessTokens.set(accessToken, tokenGrant);
    refreshTokens.set(refreshToken, { ...grant });
    const user = [...realmUsers(grant.applicationId).values()].find(
      (candidate) => candidate.id === grant.userId
    );
    const idToken = mockIdToken({
      sub: grant.userId,
      email: user?.email,
      nonce: grant.nonce,
      aud: grant.clientId,
      exp: Math.floor(now().getTime() / 1000) + expiresIn,
    });
    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
      expires_at: Math.floor(tokenGrant.expiresAt / 1000),
      refresh_token: refreshToken,
      scope: grant.scope,
      id_token: idToken,
    };
  }
};

const mockIdToken = (claims) => {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(claims)}.`;
};
