import type { model } from '../../../model/namespace';
import type { LoginMethod } from './types';
import {
  AUTH_BASE_PATH,
  SESSION_REQUEST_HEADER,
  SIGNED_IN_COOKIE,
  readBrowserCookie,
} from './sessionCookies';

/** What the session handlers return: the user and the access token for this tab's memory. */
export interface BrowserSession {
  user: model.User;
  accessToken: string;
  expiresAt: string;
  loginMethod?: LoginMethod;
}

export type SessionChange =
  | { type: 'session'; session: BrowserSession }
  /** The session ended on the server (refresh rejected) while this tab still had one. */
  | { type: 'expired' }
  | { type: 'signed-out' };

export interface AuthorizationOptions {
  prompt?: 'login' | 'create' | 'select_account' | 'consent';
  /** Path of this storefront to return to after signing in; the current page by default. */
  returnTo?: string;
}

export class StorefrontSessionError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'StorefrontSessionError';
  }
}

/** An access token this close to its expiry is not used for a new request. */
const EXPIRY_MARGIN_MS = 60_000;

/**
 * Browser side of the storefront session (BFF, design F0/F1). Tokens never touch storage the
 * page can read: the access token is fetched from `/auth/token` into memory, refreshed on the
 * server, and the refresh token stays in an HttpOnly cookie under `/auth`.
 */
export class StorefrontSessionClient {
  private current: BrowserSession | null = null;
  private known = false;
  private loading: Promise<BrowserSession | null> | null = null;
  private refreshing: Promise<BrowserSession | null> | null = null;
  private readonly listeners = new Set<(change: SessionChange) => void>();

  constructor(private readonly basePath = AUTH_BASE_PATH) {}

  subscribe(listener: (change: SessionChange) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Whether this browser has a session cookie, readable without asking the server. */
  hasSession(): boolean {
    return readBrowserCookie(SIGNED_IN_COOKIE) === '1';
  }

  /** The access token for the next API request, or null for a guest. */
  async getAccessToken(): Promise<string | null> {
    if (this.current && isFresh(this.current)) return this.current.accessToken;
    if (!this.current && !this.hasSession()) {
      this.known = true;
      return null;
    }
    return (await this.load())?.accessToken ?? null;
  }

  /** Reads the session from the server, refreshing an expired access token there. */
  load(): Promise<BrowserSession | null> {
    if (!this.loading) {
      this.loading = this.call('GET', '/token').finally(() => {
        this.loading = null;
      });
    }
    return this.loading;
  }

  /**
   * Exchanges the refresh token now, e.g. after the API rejected the access token. Resolves
   * to null when the session is over.
   */
  refresh(): Promise<BrowserSession | null> {
    if (!this.refreshing) {
      this.refreshing = this.call('POST', '/refresh').finally(() => {
        this.refreshing = null;
      });
    }
    return this.refreshing;
  }

  /**
   * Takes the session a sign-in on this page has just issued (the headless sign-in returns it
   * with the session cookies), so the page continues signed in without a reload.
   */
  adopt(session: BrowserSession): void {
    this.setSession(session, 'expired');
  }

  /** Starts the IAM-hosted sign-in; the page leaves for `/auth/login`. */
  authorize(options: AuthorizationOptions = {}): Promise<never> {
    const query = new URLSearchParams({
      returnTo:
        options.returnTo ??
        `${location.pathname}${location.search}${location.hash}`,
    });
    if (options.prompt) query.set('prompt', options.prompt);
    location.assign(`${this.basePath}/login?${query}`);
    return new Promise<never>(() => undefined);
  }

  /**
   * Ends the session on the server: the tokens are revoked and the session and cart cookies
   * cleared. Returns the IAM end-session URL to leave for, when IAM sign-out is configured.
   */
  async signOut(options: { cartCookieName?: string } = {}): Promise<string | null> {
    const response = await fetch(`${this.basePath}/logout`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        [SESSION_REQUEST_HEADER]: '1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cartCookieName: options.cartCookieName }),
    });
    if (!response.ok) {
      throw new StorefrontSessionError(
        `Sign-out failed (${response.status})`,
        response.status
      );
    }
    const body = (await response.json()) as { redirectUrl?: string | null };
    this.setSession(null, 'signed-out');
    return body.redirectUrl ?? null;
  }

  private async call(
    method: 'GET' | 'POST',
    path: string
  ): Promise<BrowserSession | null> {
    const response = await fetch(`${this.basePath}${path}`, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { [SESSION_REQUEST_HEADER]: '1' },
    });
    if (response.status === 401) {
      this.setSession(null, 'expired');
      return null;
    }
    if (!response.ok) {
      // The session server could not reach IAM: keep what this tab has for the next try.
      throw new StorefrontSessionError(
        `Session request failed (${response.status})`,
        response.status
      );
    }
    const body = (await response.json()) as { session: BrowserSession | null };
    this.setSession(body.session, 'expired');
    return body.session;
  }

  private setSession(
    session: BrowserSession | null,
    endReason: 'expired' | 'signed-out'
  ): void {
    const hadSession = this.current !== null || !this.known;
    this.current = session;
    this.known = true;
    if (session) {
      this.emit({ type: 'session', session });
    } else if (endReason === 'signed-out') {
      this.emit({ type: 'signed-out' });
    } else if (hadSession) {
      this.emit({ type: 'expired' });
    }
  }

  private emit(change: SessionChange): void {
    this.listeners.forEach((listener) => listener(change));
  }
}

function isFresh(session: BrowserSession): boolean {
  return Date.parse(session.expiresAt) - EXPIRY_MARGIN_MS > Date.now();
}

/** The session client of this browser tab, shared by the session provider and Apollo. */
export const storefrontSession = new StorefrontSessionClient();
