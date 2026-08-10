import type { components } from '../../../openapi/application-auth';
import type {
  ApplicationAuthConfig,
  ApplicationAuthScope,
} from '../../../graphql/apollo/types';
import type {
  ForgotPasswordInput,
  ResetPasswordInput,
  Session,
  SignInInput,
  SignUpInput,
} from './types';
import {
  clearAccessTokenCookie,
  getCookie,
  setAccessTokenCookie,
} from './tokenStorage';

type AuthenticationResponse =
  components['schemas']['ApplicationAuthenticationResponse'];
type ApplicationSession = components['schemas']['ApplicationSession'];
type OAuthTokenResponse = components['schemas']['OAuthTokenResponse'];
type OpenIdUserInfo = components['schemas']['OpenIdUserInfo'];

const DEFAULT_SCOPES: readonly ApplicationAuthScope[] = [
  'openid',
  'profile',
  'email',
  'offline_access',
];

interface OAuthTransaction {
  state: string;
  nonce: string;
  verifier: string;
  returnTo?: string;
}

export interface AuthorizationOptions {
  prompt?:
    | 'none'
    | 'consent'
    | 'login'
    | 'create'
    | 'select_account'
    | 'login consent'
    | 'select_account consent';
  returnTo?: string;
}

export class ApplicationAuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string
  ) {
    super(message);
    this.name = 'ApplicationAuthError';
  }
}

export class ApplicationAuthClient {
  readonly applicationBaseUrl: string;
  private refreshPromise: Promise<Session | null> | null = null;

  constructor(readonly config: ApplicationAuthConfig) {
    this.applicationBaseUrl = `${config.iamUrl.replace(/\/$/, '')}/auth/applications/${encodeURIComponent(config.applicationId)}`;
  }

  async signInWithPassword(
    input: SignInInput
  ): Promise<AuthenticationResponse> {
    return this.json<AuthenticationResponse>('/sign-in/email', {
      method: 'POST',
      body: JSON.stringify({ ...input, rememberMe: input.rememberMe ?? true }),
    });
  }

  async signUpWithPassword(
    input: SignUpInput
  ): Promise<AuthenticationResponse> {
    return this.json<AuthenticationResponse>('/sign-up/email', {
      method: 'POST',
      body: JSON.stringify({ ...input, rememberMe: input.rememberMe ?? true }),
    });
  }

  async requestPasswordReset(input: ForgotPasswordInput): Promise<void> {
    await this.json('/request-password-reset', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    await this.json('/reset-password', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  listSessions(): Promise<readonly ApplicationSession[]> {
    return this.json<readonly ApplicationSession[]>('/list-sessions');
  }

  async revokeSession(token: string): Promise<boolean> {
    const response = await this.json<{ status: boolean }>('/revoke-session', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    return response.status;
  }

  async createAuthorizationUrl(
    options: AuthorizationOptions = {}
  ): Promise<string> {
    this.assertBrowser();
    const transaction: OAuthTransaction = {
      state: randomBase64Url(32),
      nonce: randomBase64Url(32),
      verifier: randomBase64Url(64),
      returnTo: options.returnTo,
    };
    const challenge = await sha256Base64Url(transaction.verifier);
    sessionStorage.setItem(this.transactionKey, JSON.stringify(transaction));

    const query = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: (this.config.scopes ?? DEFAULT_SCOPES).join(' '),
      state: transaction.state,
      nonce: transaction.nonce,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      resource: this.config.resource,
    });
    if (options.prompt) query.set('prompt', options.prompt);
    return `${this.applicationBaseUrl}/oauth2/authorize?${query}`;
  }

  async authorize(options: AuthorizationOptions = {}): Promise<never> {
    location.assign(await this.createAuthorizationUrl(options));
    return new Promise<never>(() => undefined);
  }

  async completeAuthorizationCallback(
    callbackUrl = location.href
  ): Promise<Session> {
    this.assertBrowser();
    const url = new URL(callbackUrl);
    const transaction = this.readTransaction();
    const error = url.searchParams.get('error');
    if (error) {
      sessionStorage.removeItem(this.transactionKey);
      throw new ApplicationAuthError(
        url.searchParams.get('error_description') ?? error,
        400,
        error
      );
    }
    if (!transaction || url.searchParams.get('state') !== transaction.state) {
      sessionStorage.removeItem(this.transactionKey);
      throw new ApplicationAuthError(
        'Invalid OAuth state',
        400,
        'invalid_state'
      );
    }
    const code = url.searchParams.get('code');
    if (!code) {
      sessionStorage.removeItem(this.transactionKey);
      throw new ApplicationAuthError('Missing authorization code', 400);
    }

    try {
      const tokens = await this.exchangeToken({
        grant_type: 'authorization_code',
        code,
        code_verifier: transaction.verifier,
        redirect_uri: this.config.redirectUri,
      });
      this.validateNonce(tokens.id_token, transaction.nonce);
      return await this.persistTokens(tokens);
    } finally {
      sessionStorage.removeItem(this.transactionKey);
    }
  }

  refresh(): Promise<Session | null> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.refreshTokens().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }

  private async refreshTokens(): Promise<Session | null> {
    this.assertBrowser();
    const refreshToken = sessionStorage.getItem(this.refreshTokenKey);
    if (!refreshToken) return null;
    try {
      return await this.persistTokens(
        await this.exchangeToken({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        })
      );
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  async getSession(cookieSource?: string): Promise<Session | null> {
    const accessToken = getCookie(
      this.config.accessTokenCookieName,
      cookieSource
    );
    if (!accessToken) return null;
    try {
      const user = await this.getUserInfo(accessToken);
      return { user: mapUser(user), accessToken };
    } catch (error) {
      if (error instanceof ApplicationAuthError && error.status === 401)
        return null;
      throw error;
    }
  }

  getUserInfo(accessToken: string): Promise<OpenIdUserInfo> {
    return this.json<OpenIdUserInfo>('/oauth2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  async signOut(): Promise<void> {
    this.assertBrowser();
    const accessToken = getCookie(this.config.accessTokenCookieName);
    const refreshToken = sessionStorage.getItem(this.refreshTokenKey);
    if (accessToken) {
      await this.revokeOAuthToken(accessToken, 'access_token').catch(
        () => undefined
      );
    }
    if (refreshToken) {
      await this.revokeOAuthToken(refreshToken, 'refresh_token').catch(
        () => undefined
      );
    }
    try {
      await this.json('/sign-out', { method: 'POST' });
    } finally {
      this.clearTokens();
    }
  }

  clearTokens(): void {
    this.assertBrowser();
    clearAccessTokenCookie(this.config);
    sessionStorage.removeItem(this.refreshTokenKey);
    sessionStorage.removeItem(this.idTokenKey);
  }

  get callbackReturnTo(): string | undefined {
    return this.readTransaction()?.returnTo;
  }

  private async exchangeToken(
    grant: Record<string, string>
  ): Promise<OAuthTokenResponse> {
    const body = new URLSearchParams({
      ...grant,
      client_id: this.config.clientId,
      resource: this.config.resource,
    });
    return this.json<OAuthTokenResponse>('/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
  }

  private async revokeOAuthToken(
    token: string,
    hint: 'access_token' | 'refresh_token'
  ): Promise<void> {
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      token,
      token_type_hint: hint,
    });
    await this.request('/oauth2/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
  }

  private async persistTokens(tokens: OAuthTokenResponse): Promise<Session> {
    setAccessTokenCookie(this.config, tokens.access_token, tokens.expires_in);
    if (tokens.refresh_token) {
      sessionStorage.setItem(this.refreshTokenKey, tokens.refresh_token);
    }
    if (tokens.id_token)
      sessionStorage.setItem(this.idTokenKey, tokens.id_token);
    const user = await this.getUserInfo(tokens.access_token);
    const expiresAt = new Date(
      (tokens.expires_at ?? Math.floor(Date.now() / 1000) + tokens.expires_in) *
        1000
    ).toISOString();
    return { user: mapUser(user), accessToken: tokens.access_token, expiresAt };
  }

  private validateNonce(idToken: string | undefined, nonce: string): void {
    if (!(this.config.scopes ?? DEFAULT_SCOPES).includes('openid')) return;
    if (!idToken)
      throw new ApplicationAuthError('Missing ID token', 400, 'invalid_token');
    const claims = decodeJwtPayload(idToken);
    if (claims.nonce !== nonce) {
      throw new ApplicationAuthError(
        'Invalid ID token nonce',
        400,
        'invalid_nonce'
      );
    }
  }

  private async json<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await this.request(path, init);
    if (response.status === 204) return undefined as T;
    const text = await response.text();
    return text ? (JSON.parse(text) as T) : (undefined as T);
  }

  private async request(path: string, init: RequestInit): Promise<Response> {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    const response = await fetch(`${this.applicationBaseUrl}${path}`, {
      ...init,
      headers,
      credentials: 'include',
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new ApplicationAuthError(
        body.error_description ??
          body.message ??
          body.error ??
          `IAM request failed (${response.status})`,
        response.status,
        body.error
      );
    }
    return response;
  }

  private readTransaction(): OAuthTransaction | null {
    this.assertBrowser();
    const value = sessionStorage.getItem(this.transactionKey);
    if (!value) return null;
    try {
      return JSON.parse(value) as OAuthTransaction;
    } catch {
      return null;
    }
  }

  private assertBrowser(): void {
    if (typeof window === 'undefined') {
      throw new Error('This application auth operation is browser-only');
    }
  }

  private get storagePrefix(): string {
    return `shopana.auth.${this.config.applicationId}.${this.config.clientId}`;
  }
  private get transactionKey(): string {
    return `${this.storagePrefix}.transaction`;
  }
  private get refreshTokenKey(): string {
    return `${this.storagePrefix}.refreshToken`;
  }
  private get idTokenKey(): string {
    return `${this.storagePrefix}.idToken`;
  }
}

function mapUser(user: OpenIdUserInfo) {
  return {
    id: user.sub,
    email: user.email ?? '',
    firstName: user.given_name ?? undefined,
    lastName: user.family_name ?? undefined,
  };
}

function randomBase64Url(byteLength: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return bytesToBase64Url(bytes);
}

async function sha256Base64Url(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value)
  );
  return bytesToBase64Url(new Uint8Array(digest));
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let value = '';
  bytes.forEach((byte) => {
    value += String.fromCharCode(byte);
  });
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split('.')[1];
  if (!payload)
    throw new ApplicationAuthError('Malformed ID token', 400, 'invalid_token');
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
}

export type {
  ApplicationSession,
  AuthenticationResponse,
  OAuthTokenResponse,
  OpenIdUserInfo,
};
