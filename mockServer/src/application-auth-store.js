import { randomBytes, randomUUID } from 'node:crypto';

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

export const createApplicationAuthStore = ({ now = () => new Date() } = {}) => {
  const usersByRealm = new Map();
  const sessionsByToken = new Map();

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
      return null;
    }
    return session;
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
      const session = createSession(
        applicationId,
        user,
        request,
        input.rememberMe !== false
      );
      return { session, user: publicUser(user) };
    },

    signIn(applicationId, input, request) {
      const user = realmUsers(applicationId).get(normalizeEmail(input.email));
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
      if (!target || target.userId !== current.userId) return false;
      sessionsByToken.delete(token);
      return true;
    },

    signOut(applicationId, currentToken) {
      const current = findActiveSession(applicationId, currentToken);
      if (current) sessionsByToken.delete(current.token);
    },
  };
};
