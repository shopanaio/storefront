import type { components } from '../../../openapi/application-auth';
import type { ApplicationAuthConfig } from '../../../graphql/apollo/types';
import type {
  ForgotPasswordInput,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
} from './types';

type AuthenticationResponse =
  components['schemas']['ApplicationAuthenticationResponse'];
type ApplicationSession = components['schemas']['ApplicationSession'];

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

/**
 * Browser calls to the IAM application endpoints that work with the IAM session cookie
 * (password sign-in and sign-up, password reset, IAM sessions). OAuth tokens are not handled
 * here: the storefront session server owns them.
 */
export class IamApplicationClient {
  readonly applicationBaseUrl: string;

  constructor(readonly config: ApplicationAuthConfig) {
    if (!config?.iamUrl || !config.applicationId) {
      throw new Error(
        'Application auth configuration is missing: iamUrl, applicationId'
      );
    }
    this.applicationBaseUrl = `${config.iamUrl.replace(/\/$/, '')}/auth/applications/${encodeURIComponent(config.applicationId)}`;
  }

  signInWithPassword(input: SignInInput): Promise<AuthenticationResponse> {
    return this.json<AuthenticationResponse>('/sign-in/email', {
      method: 'POST',
      body: JSON.stringify({ ...input, rememberMe: input.rememberMe ?? true }),
    });
  }

  signUpWithPassword(input: SignUpInput): Promise<AuthenticationResponse> {
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

  private async json<T>(path: string, init: RequestInit = {}): Promise<T> {
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
    if (response.status === 204) return undefined as T;
    const text = await response.text();
    return text ? (JSON.parse(text) as T) : (undefined as T);
  }
}

export type { ApplicationSession, AuthenticationResponse };
