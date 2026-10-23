import { createHash, randomBytes, randomUUID } from 'node:crypto';

const normalizeEmail = (email) => email.trim().toLowerCase();
const publicUser = (user) => ({
  id: user.id,
  applicationId: user.applicationId,
  email: user.email,
  emailVerified: user.emailVerified,
  phoneNumber: user.phoneNumber,
  phoneNumberVerified: user.phoneNumberVerified,
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
  const emailVerificationTokens = new Map();

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

  /** Users of a realm by id; an account has an email, a phone number or both. */
  const realmUsers = (applicationId) => {
    let users = usersByRealm.get(applicationId);
    if (!users) {
      users = new Map();
      usersByRealm.set(applicationId, users);
    }
    return users;
  };

  const findUser = (applicationId, predicate) =>
    [...realmUsers(applicationId).values()].find(predicate) ?? null;

  const userByEmail = (applicationId, email) => {
    const normalized = normalizeEmail(email);
    return findUser(applicationId, (user) => user.email === normalized);
  };

  const userByPhone = (applicationId, phoneNumber) =>
    findUser(applicationId, (user) => user.phoneNumber === phoneNumber);

  const userById = (applicationId, id) =>
    realmUsers(applicationId).get(id) ?? null;

  const newUser = (applicationId, fields) => {
    const timestamp = now().toISOString();
    const user = {
      id: randomUUID(),
      applicationId,
      email: null,
      emailVerified: false,
      phoneNumber: null,
      phoneNumberVerified: false,
      name: '',
      firstName: null,
      lastName: null,
      image: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      password: null,
      /** Connected social provider accounts: `{ provider, accountId, email }`. */
      accounts: [],
      ...fields,
    };
    realmUsers(applicationId).set(user.id, user);
    return user;
  };

  /** The signed-in user of an OAuth access token. */
  const userOfAccessToken = (applicationId, token) => {
    const grant = accessTokens.get(token);
    if (
      !grant ||
      grant.applicationId !== applicationId ||
      grant.expiresAt <= now().getTime() ||
      !findActiveSessionById(applicationId, grant.applicationSessionId)
    )
      return null;
    return userById(applicationId, grant.userId);
  };

  const userOfProviderAccount = (applicationId, provider, accountId) =>
    findUser(applicationId, (user) =>
      user.accounts.some(
        (account) =>
          account.provider === provider && account.accountId === accountId
      )
    );

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

  /**
   * Provisions the storefront customer of a new user. The mock customer store matches
   * customers by email; a phone-only user is provisioned under a placeholder email that no
   * customer has, and the customer then gets the phone number instead of an email.
   */
  const linkCustomer = (user) => {
    if (!customerStore) return null;
    const customer = user.email
      ? customerStore.provisionCustomer(user)
      : customerStore.provisionCustomer({
          ...user,
          email: `${user.id}@phone.invalid`,
        });
    if (!user.email) {
      customer.emailAddress = null;
      customer.phoneNumber = {
        phoneNumber: user.phoneNumber,
        verified: user.phoneNumberVerified,
        marketingConsent: null,
      };
    }
    customerIdsByUserId.set(user.id, customer.id);
    return customer;
  };

  const seedFixtureUser = (applicationId, email, password) => {
    if (password !== fixturePassword) return null;
    const customer = customerStore?.customerByEmail(email);
    if (!customer) return null;

    const user = newUser(applicationId, {
      email: normalizeEmail(email),
      emailVerified: true,
      name: customer.displayName,
      firstName: customer.firstName || null,
      lastName: customer.lastName || null,
      password: fixturePassword,
    });
    customerIdsByUserId.set(user.id, customer.id);
    return user;
  };

  /** Session of a user signed in without a password (code, provider). */
  const passwordlessSession = (applicationId, user, request) => ({
    session: createSession(applicationId, user, request, true),
    user: publicUser(user),
  });

  return {
    /**
     * Creates an email/password account. With `requireVerifiedEmail` the account is created
     * without a session and answers `email_not_verified`.
     */
    signUp(
      applicationId,
      input,
      request,
      { requireVerifiedEmail = false } = {}
    ) {
      if (userByEmail(applicationId, input.email)) {
        return { error: 'email_already_exists' };
      }
      const user = newUser(applicationId, {
        email: normalizeEmail(input.email),
        name: input.name.trim(),
        firstName: input.firstName?.trim() || null,
        lastName: input.lastName?.trim() || null,
        image: input.image || null,
        password: input.password,
      });
      linkCustomer(user);
      if (requireVerifiedEmail) {
        return { error: 'email_not_verified', user: publicUser(user) };
      }
      const session = createSession(
        applicationId,
        user,
        request,
        input.rememberMe !== false
      );
      return { session, user: publicUser(user) };
    },

    /**
     * Signs in with email and password. With `requireVerifiedEmail` a correct password of an
     * unverified email answers `email_not_verified` without a session.
     */
    signIn(
      applicationId,
      input,
      request,
      { requireVerifiedEmail = false } = {}
    ) {
      const user =
        userByEmail(applicationId, input.email) ??
        seedFixtureUser(applicationId, input.email, input.password);
      if (!user || !user.password || user.password !== input.password) {
        return { error: 'invalid_credentials' };
      }
      if (requireVerifiedEmail && !user.emailVerified) {
        return { error: 'email_not_verified', user: publicUser(user) };
      }
      const session = createSession(
        applicationId,
        user,
        request,
        input.rememberMe !== false
      );
      return { session, user: publicUser(user) };
    },

    /**
     * Session for a confirmed email code (headless email OTP): signs in the account of the
     * email, creating it when there is none, as IAM does when OTP sign-up is allowed.
     */
    signInWithEmailCode(applicationId, email, request) {
      let user = userByEmail(applicationId, email);
      if (!user) {
        const normalized = normalizeEmail(email);
        user = newUser(applicationId, {
          email: normalized,
          emailVerified: true,
          name: normalized.split('@')[0],
        });
        linkCustomer(user);
      }
      user.emailVerified = true;
      return passwordlessSession(applicationId, user, request);
    },

    /**
     * Session for a confirmed phone code (headless phone OTP): signs in the account of the
     * phone number, creating a phone-only account when there is none.
     */
    signInWithPhoneCode(applicationId, phoneNumber, request) {
      let user = userByPhone(applicationId, phoneNumber);
      if (!user) {
        user = newUser(applicationId, {
          phoneNumber,
          phoneNumberVerified: true,
          name: phoneNumber,
        });
        linkCustomer(user);
      }
      user.phoneNumberVerified = true;
      return passwordlessSession(applicationId, user, request);
    },

    /**
     * Session for a social provider account (`accountId` is the provider subject; the mock
     * uses the provider email). Signs in the user the account is connected to; otherwise
     * connects it to the user of the same email, or creates a user with a verified email.
     */
    signInWithProvider(applicationId, provider, profile, request) {
      let user = userOfProviderAccount(
        applicationId,
        provider,
        profile.accountId
      );
      if (!user) {
        user = userByEmail(applicationId, profile.email);
        if (!user) {
          const email = normalizeEmail(profile.email);
          user = newUser(applicationId, {
            email,
            emailVerified: true,
            name: profile.name?.trim() || email.split('@')[0],
          });
          linkCustomer(user);
        }
        user.emailVerified = true;
        user.accounts.push({
          provider,
          accountId: profile.accountId,
          email: normalizeEmail(profile.email),
        });
      }
      return passwordlessSession(applicationId, user, request);
    },

    /** Social connections of the user of an access token; null for an invalid token. */
    accountConnections(applicationId, accessToken) {
      const user = userOfAccessToken(applicationId, accessToken);
      return user ? user.accounts.map((account) => account.provider) : null;
    },

    /** Id of the signed-in user of an access token, or null. */
    userIdOfAccessToken(applicationId, accessToken) {
      return userOfAccessToken(applicationId, accessToken)?.id ?? null;
    },

    /**
     * Connects a provider account to a user: `linked`, or `account_conflict` when the account
     * belongs to another user or the user already has an account of the provider.
     */
    linkProviderAccount(applicationId, userId, provider, profile) {
      const user = userById(applicationId, userId);
      if (!user) return 'linking_failed';
      const owner = userOfProviderAccount(
        applicationId,
        provider,
        profile.accountId
      );
      if (owner && owner.id !== user.id) return 'account_conflict';
      if (owner) return 'linked';
      if (user.accounts.some((account) => account.provider === provider)) {
        return 'account_conflict';
      }
      user.accounts.push({
        provider,
        accountId: profile.accountId,
        email: normalizeEmail(profile.email),
      });
      user.updatedAt = now().toISOString();
      return 'linked';
    },

    /**
     * Disconnects the provider: `unlinked`, `not_connected`, or `last_login_method` when the
     * user has no other way to sign in (`signInMethods` says which passwordless methods count).
     */
    unlinkProviderAccount(applicationId, accessToken, provider, signInMethods) {
      const user = userOfAccessToken(applicationId, accessToken);
      if (!user) return 'invalid_token';
      const accounts = user.accounts.filter(
        (account) => account.provider === provider
      );
      if (accounts.length === 0) return 'not_connected';
      if (accounts.length > 1) return 'account_conflict';
      const otherMethod =
        Boolean(user.password) ||
        (signInMethods.emailOtp && Boolean(user.email)) ||
        (signInMethods.phoneOtp && Boolean(user.phoneNumber)) ||
        user.accounts.some((account) => account.provider !== provider);
      if (!otherMethod) return 'last_login_method';
      user.accounts = user.accounts.filter(
        (account) => account.provider !== provider
      );
      user.updatedAt = now().toISOString();
      return 'unlinked';
    },

    /** Verification token of an unverified email; null for an unknown or verified email. */
    requestEmailVerification(applicationId, email) {
      const user = userByEmail(applicationId, email);
      if (!user || user.emailVerified) return null;
      const token = randomBytes(32).toString('base64url');
      emailVerificationTokens.set(token, {
        applicationId,
        userId: user.id,
        expiresAt: now().getTime() + 24 * 60 * 60 * 1000,
      });
      return token;
    },

    /** Verifies the email of a token; a spent, expired or unknown token answers false. */
    verifyEmail(applicationId, token) {
      const verification = emailVerificationTokens.get(token);
      emailVerificationTokens.delete(token);
      if (
        !verification ||
        verification.applicationId !== applicationId ||
        verification.expiresAt <= now().getTime()
      ) {
        return false;
      }
      const user = userById(applicationId, verification.userId);
      if (!user || user.emailVerified) return false;
      user.emailVerified = true;
      user.updatedAt = now().toISOString();
      return true;
    },

    requestPasswordReset(applicationId, email) {
      const user = userByEmail(applicationId, email);
      if (!user) return null;
      const token = randomBytes(32).toString('base64url');
      passwordResetTokens.set(token, {
        applicationId,
        userId: user.id,
        expiresAt: now().getTime() + 60 * 60 * 1000,
      });
      return token;
    },

    /** Whether a reset token can still set a password (not spent, not expired). */
    isPasswordResetTokenValid(applicationId, token) {
      const reset = passwordResetTokens.get(token);
      return Boolean(
        reset &&
        reset.applicationId === applicationId &&
        reset.expiresAt > now().getTime()
      );
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
      const user = userById(applicationId, reset.userId);
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
      const user = userOfAccessToken(applicationId, token);
      if (!user) return null;
      return {
        sub: user.id,
        email: user.email,
        email_verified: user.emailVerified,
        phone_number: user.phoneNumber,
        phone_number_verified: user.phoneNumberVerified,
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
    const user = userById(grant.applicationId, grant.userId);
    const idToken = mockIdToken({
      sub: grant.userId,
      email: user?.email ?? undefined,
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
