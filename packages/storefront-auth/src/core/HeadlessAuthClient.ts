import {
  storefrontSession,
  type StorefrontSessionClient,
} from '@shopana/storefront-sdk/modules/session';
import { AuthError } from './AuthError';
import {
  AUTH_ERROR_CODES,
  HEADLESS_AUTH_BASE_PATH,
  type AuthConfiguration,
  type AuthErrorBody,
  type AuthErrorCode,
  type AuthStep,
  type EmailOtpSendInput,
  type EmailOtpVerifyInput,
  type HeadlessAction,
  type HeadlessActionInputs,
  type PasswordSignInInput,
  type PasswordSignUpInput,
  type PhoneOtpSendInput,
  type PhoneOtpVerifyInput,
  type SocialStartInput,
} from './types';

/** Header the session handlers require; it forces a CORS preflight they never allow. */
const SESSION_REQUEST_HEADER = 'x-shopana-session';

export interface HeadlessAuthClientOptions {
  basePath?: string;
  /** Session client of this tab; it takes the session a completed sign-in returns. */
  session?: StorefrontSessionClient;
  /** Called after the session is adopted, e.g. to attach the account cart. */
  onSignedIn?: () => void;
}

/**
 * Browser side of the headless sign-in. Every call goes to this storefront's own server, which
 * holds the IAM client secret, the PKCE verifier and the IAM transaction in a sealed cookie;
 * tokens never reach the page except the in-memory access token of the session client.
 */
export class HeadlessAuthClient {
  private readonly basePath: string;
  private readonly session: StorefrontSessionClient;
  private configurationRequest: Promise<AuthConfiguration> | null = null;
  private stepRequest: Promise<AuthStep> | null = null;

  constructor(private readonly options: HeadlessAuthClientOptions = {}) {
    this.basePath = options.basePath ?? HEADLESS_AUTH_BASE_PATH;
    this.session = options.session ?? storefrontSession;
  }

  /** Enabled methods and validation rules; read once per tab. */
  configuration(): Promise<AuthConfiguration> {
    if (!this.configurationRequest) {
      this.configurationRequest = this.request<AuthConfiguration>(
        'GET',
        'configuration'
      ).catch((error: unknown) => {
        this.configurationRequest = null;
        throw error;
      });
    }
    return this.configurationRequest;
  }

  passwordSignIn(input: PasswordSignInInput): Promise<AuthStep> {
    return this.step('password-sign-in', input);
  }

  passwordSignUp(input: PasswordSignUpInput): Promise<AuthStep> {
    return this.step('password-sign-up', input);
  }

  sendEmailOtp(input: EmailOtpSendInput): Promise<AuthStep> {
    return this.step('email-otp-send', input);
  }

  verifyEmailOtp(input: EmailOtpVerifyInput): Promise<AuthStep> {
    return this.step('email-otp-verify', input);
  }

  sendPhoneOtp(input: PhoneOtpSendInput): Promise<AuthStep> {
    return this.step('phone-otp-send', input);
  }

  verifyPhoneOtp(input: PhoneOtpVerifyInput): Promise<AuthStep> {
    return this.step('phone-otp-verify', input);
  }

  /** Leaves for the provider; the sign-in completes at `/auth/callback`. */
  async startSocial(input: SocialStartInput): Promise<never> {
    const step = await this.step('social-start', {
      provider: input.provider,
      returnTo:
        input.returnTo ??
        `${location.pathname}${location.search}${location.hash}`,
    });
    if (step.type !== 'redirect') {
      throw new AuthError('unavailable', 'Social sign-in did not start', 502);
    }
    location.assign(step.url);
    return new Promise<never>(() => undefined);
  }

  /**
   * One step at a time per tab: IAM accepts a transaction id once, so a second step sent while
   * one is running (a double submit) would fail or start a second sign-in. It resolves to the
   * outcome of the running step instead.
   */
  private step<A extends HeadlessAction>(
    action: A,
    input: HeadlessActionInputs[A]
  ): Promise<AuthStep> {
    if (!this.stepRequest) {
      this.stepRequest = this.runStep(action, input).finally(() => {
        this.stepRequest = null;
      });
    }
    return this.stepRequest;
  }

  private async runStep<A extends HeadlessAction>(
    action: A,
    input: HeadlessActionInputs[A]
  ): Promise<AuthStep> {
    const step = await this.request<AuthStep>('POST', action, input);
    if (step.type === 'completed') {
      this.session.adopt(step.session);
      this.options.onSignedIn?.();
    }
    return step;
  }

  private async request<T>(
    method: 'GET' | 'POST',
    action: string,
    body?: unknown
  ): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.basePath}/${action}`, {
        method,
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
          [SESSION_REQUEST_HEADER]: '1',
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new AuthError('unavailable', 'Sign-in server is unreachable', 0);
    }
    const payload: unknown = await response.json().catch(() => null);
    const body =
      payload !== null && typeof payload === 'object'
        ? (payload as Partial<AuthErrorBody>)
        : null;
    if (!response.ok) {
      throw new AuthError(
        authErrorCode(body?.error),
        typeof body?.message === 'string'
          ? body.message
          : `Sign-in request failed (${response.status})`,
        response.status,
        typeof body?.retryAfter === 'number' ? body.retryAfter : undefined
      );
    }
    if (!body) {
      throw new AuthError(
        'unavailable',
        'Sign-in server answered without a body',
        response.status
      );
    }
    return body as T;
  }
}

/** A code the forms know; anything else, such as a rejected cross-site call, is `unavailable`. */
function authErrorCode(value: unknown): AuthErrorCode {
  return AUTH_ERROR_CODES.includes(value as AuthErrorCode)
    ? (value as AuthErrorCode)
    : 'unavailable';
}
