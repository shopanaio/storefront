import {
  END_USER_IP_HEADER,
  clientBasicAuthorization,
  retryAfterSeconds,
  type StorefrontSessionServer,
} from '@shopana/storefront-sdk/modules/session/server';
import type { ApplicationAuthComponents } from '@shopana/storefront-sdk';
import type { AuthConfiguration } from '../core/types';

/**
 * Server-to-server client of the IAM headless API (`/auth/applications/{id}/headless/v1/*`,
 * contract k4hd). IAM accepts it only from a confidential client with `client_secret_basic`,
 * without an `Origin` header, and with the buyer address in `shopana-end-user-ip`.
 */

const END_USER_AGENT_HEADER = 'shopana-end-user-agent';
/** The buyer's access token on account requests; `Authorization` authenticates the client. */
const END_USER_ACCESS_TOKEN_HEADER = 'shopana-end-user-access-token';
const MAX_USER_AGENT_LENGTH = 512;

export interface EndUser {
  ip: string;
  userAgent?: string;
}

export interface IamHeadlessConfiguration extends AuthConfiguration {
  revision: number;
}

export type IamHeadlessStep =
  | 'password/sign-in'
  | 'password/sign-up'
  | 'email-otp/send'
  | 'email-otp/verify'
  | 'phone-otp/send'
  | 'phone-otp/verify'
  | 'social/start'
  | 'password/forgot'
  | 'email-verification/resend';

export type IamHeadlessStepResponse =
  | { status: 'completed'; code: string; state: string; iss: string }
  | {
      status: 'otp_sent';
      channel: 'email' | 'phone';
      resend_after: number;
      expires_in: number;
      transaction_id: string;
    }
  | {
      status: 'verification_required';
      channel: 'email';
      method: 'otp' | 'link';
      transaction_id: string;
    }
  | { status: 'sign_in_required'; transaction_id: string }
  | { status: 'reset_link_sent'; transaction_id: string }
  | { status: 'verification_sent'; transaction_id: string }
  | { status: 'redirect'; url: string };

/** IAM OpenAPI contract of the account connections answer. */
export type IamAccountConnections =
  ApplicationAuthComponents['schemas']['HeadlessAccountConnections'];

export interface IamTransactionStart {
  state: string;
  nonce: string;
  codeChallenge: string;
}

export interface IamTransaction {
  id: string;
  /** Seconds until IAM expires the transaction unless a step rotates it. */
  expiresIn: number;
}

/** IAM headless error; `transactionId` is the rotated transaction a failed step still left. */
export class IamHeadlessError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly transactionId?: string,
    readonly retryAfter?: number
  ) {
    super(message);
    this.name = 'IamHeadlessError';
  }
}

export class IamHeadlessClient {
  private readonly baseUrl: string;
  private configurationCache: {
    etag: string;
    value: IamHeadlessConfiguration;
  } | null = null;

  constructor(private readonly server: StorefrontSessionServer) {
    this.baseUrl = `${server.iam.applicationBaseUrl}/headless/v1`;
  }

  /** Issuer IAM puts into `iss` of a completed step. */
  get issuer(): string {
    return this.server.iam.applicationBaseUrl;
  }

  /** The configuration, revalidated by ETag on every call (BR-k4i6). */
  async configuration(endUser: EndUser): Promise<IamHeadlessConfiguration> {
    const headers = this.headers(endUser);
    if (this.configurationCache) {
      headers.set('If-None-Match', this.configurationCache.etag);
    }
    const response = await this.fetch('/configuration', { headers });
    if (response.status === 304 && this.configurationCache) {
      return this.configurationCache.value;
    }
    await assertOk(response);
    const value = (await response.json()) as IamHeadlessConfiguration;
    const etag = response.headers.get('etag');
    this.configurationCache = etag ? { etag, value } : null;
    return value;
  }

  async startTransaction(
    input: IamTransactionStart,
    endUser: EndUser
  ): Promise<IamTransaction> {
    const config = this.server.config;
    const body = await this.json<{
      transaction_id: string;
      expires_in: number;
    }>(
      '/transactions',
      {
        redirect_uri: config.redirectUri,
        scope: config.scopes.join(' '),
        resource: config.resource,
        state: input.state,
        nonce: input.nonce,
        code_challenge: input.codeChallenge,
        code_challenge_method: 'S256',
      },
      endUser
    );
    return { id: body.transaction_id, expiresIn: body.expires_in };
  }

  step(
    transactionId: string,
    step: IamHeadlessStep,
    body: Record<string, unknown>,
    endUser: EndUser
  ): Promise<IamHeadlessStepResponse> {
    return this.json<IamHeadlessStepResponse>(
      `/transactions/${encodeURIComponent(transactionId)}/${step}`,
      body,
      endUser
    );
  }

  /** Sets a new password with the token of a reset link (outside any transaction). */
  async resetPassword(
    input: { token: string; password: string },
    endUser: EndUser
  ): Promise<void> {
    await this.json('/password/reset', input, endUser);
  }

  async accountConnections(
    accessToken: string,
    endUser: EndUser
  ): Promise<IamAccountConnections> {
    const headers = this.headers(endUser);
    headers.set(END_USER_ACCESS_TOKEN_HEADER, accessToken);
    const response = await this.fetch('/account/connections', { headers });
    await assertOk(response);
    return (await response.json()) as IamAccountConnections;
  }

  /** Answers the one-time URL the browser opens to connect the provider. */
  async linkAccount(
    accessToken: string,
    input: { provider: string; return_uri: string },
    endUser: EndUser
  ): Promise<string> {
    const body = await this.json<{ url: string }>(
      '/account/connections/link',
      input,
      endUser,
      accessToken
    );
    return body.url;
  }

  async unlinkAccount(
    accessToken: string,
    input: { provider: string },
    endUser: EndUser
  ): Promise<void> {
    await this.json('/account/connections/unlink', input, endUser, accessToken);
  }

  private async json<T>(
    path: string,
    body: Record<string, unknown>,
    endUser: EndUser,
    accessToken?: string
  ): Promise<T> {
    const headers = this.headers(endUser);
    headers.set('Content-Type', 'application/json');
    if (accessToken) headers.set(END_USER_ACCESS_TOKEN_HEADER, accessToken);
    const response = await this.fetch(path, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    await assertOk(response);
    return (await response.json()) as T;
  }

  private headers(endUser: EndUser): Headers {
    const headers = new Headers({
      Authorization: clientBasicAuthorization(this.server.config),
      Accept: 'application/json',
      [END_USER_IP_HEADER]: endUser.ip,
    });
    const userAgent = endUser.userAgent
      // IAM rejects control characters in the forwarded user agent.
      ?.replace(/[\u0000-\u001f\u007f]/g, ' ')
      .slice(0, MAX_USER_AGENT_LENGTH)
      .trim();
    if (userAgent) headers.set(END_USER_AGENT_HEADER, userAgent);
    return headers;
  }

  private async fetch(path: string, init: RequestInit): Promise<Response> {
    try {
      return await fetch(`${this.baseUrl}${path}`, {
        ...init,
        cache: 'no-store',
      });
    } catch {
      throw new IamHeadlessError(
        503,
        'temporarily_unavailable',
        'IAM is unreachable'
      );
    }
  }
}

async function assertOk(response: Response): Promise<void> {
  if (response.ok) return;
  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
    error_description?: string;
    transaction_id?: string;
    retry_after?: number;
  };
  throw new IamHeadlessError(
    response.status,
    body.error ?? 'server_error',
    body.error_description ?? `IAM request failed (${response.status})`,
    body.transaction_id,
    body.retry_after ?? retryAfterSeconds(response)
  );
}
