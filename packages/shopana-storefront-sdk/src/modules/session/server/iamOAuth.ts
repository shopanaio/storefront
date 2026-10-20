import type { components } from '../../../openapi/application-auth';
import type { StorefrontAuthServerConfig } from './config';

export type OAuthTokenResponse = components['schemas']['OAuthTokenResponse'];
export type OpenIdUserInfo = components['schemas']['OpenIdUserInfo'];

export class IamOAuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string
  ) {
    super(message);
    this.name = 'IamOAuthError';
  }
}

/** The IAM OAuth endpoints the storefront server calls as a confidential client. */
export class IamOAuthServerClient {
  readonly applicationBaseUrl: string;

  constructor(readonly config: StorefrontAuthServerConfig) {
    this.applicationBaseUrl = `${config.iamUrl}/auth/applications/${encodeURIComponent(config.applicationId)}`;
  }

  authorizationUrl(input: {
    state: string;
    nonce: string;
    codeChallenge: string;
    prompt?: string;
  }): string {
    const query = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      state: input.state,
      nonce: input.nonce,
      code_challenge: input.codeChallenge,
      code_challenge_method: 'S256',
      resource: this.config.resource,
    });
    if (input.prompt) query.set('prompt', input.prompt);
    return `${this.applicationBaseUrl}/oauth2/authorize?${query}`;
  }

  endSessionUrl(idToken: string): string | null {
    if (!this.config.postLogoutRedirectUri) return null;
    const query = new URLSearchParams({
      id_token_hint: idToken,
      client_id: this.config.clientId,
      post_logout_redirect_uri: this.config.postLogoutRedirectUri,
    });
    return `${this.applicationBaseUrl}/oauth2/end-session?${query}`;
  }

  exchangeCode(
    code: string,
    codeVerifier: string,
    forwardedFor?: string
  ): Promise<OAuthTokenResponse> {
    return this.tokenRequest(
      {
        grant_type: 'authorization_code',
        code,
        code_verifier: codeVerifier,
        redirect_uri: this.config.redirectUri,
        resource: this.config.resource,
      },
      forwardedFor
    );
  }

  refresh(
    refreshToken: string,
    forwardedFor?: string
  ): Promise<OAuthTokenResponse> {
    return this.tokenRequest(
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        resource: this.config.resource,
      },
      forwardedFor
    );
  }

  async revoke(
    token: string,
    hint: 'access_token' | 'refresh_token'
  ): Promise<void> {
    await this.request('/oauth2/revoke', {
      method: 'POST',
      headers: this.clientHeaders(),
      body: new URLSearchParams({ token, token_type_hint: hint }),
    });
  }

  async userInfo(accessToken: string): Promise<OpenIdUserInfo> {
    const response = await this.request('/oauth2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return (await response.json()) as OpenIdUserInfo;
  }

  /**
   * IAM rate-limits the token endpoint per client and requester IP. Every buyer reaches it
   * through this server, so the buyer address is forwarded; IAM counts it only when this
   * server is one of its trusted proxies.
   */
  private async tokenRequest(
    grant: Record<string, string>,
    forwardedFor?: string
  ): Promise<OAuthTokenResponse> {
    const headers = this.clientHeaders();
    if (forwardedFor) headers['X-Forwarded-For'] = forwardedFor;
    const response = await this.request('/oauth2/token', {
      method: 'POST',
      headers,
      body: new URLSearchParams(grant),
    });
    return (await response.json()) as OAuthTokenResponse;
  }

  /** `client_secret_basic` (RFC 6749 §2.3.1): both parts form-encoded before base64. */
  private clientHeaders(): Record<string, string> {
    const credentials = `${formEncode(this.config.clientId)}:${formEncode(this.config.clientSecret)}`;
    return {
      Authorization: `Basic ${btoa(credentials)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    };
  }

  private async request(path: string, init: RequestInit): Promise<Response> {
    const response = await fetch(`${this.applicationBaseUrl}${path}`, {
      ...init,
      cache: 'no-store',
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as Record<
        string,
        string | undefined
      >;
      throw new IamOAuthError(
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
}

function formEncode(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, '+');
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}
