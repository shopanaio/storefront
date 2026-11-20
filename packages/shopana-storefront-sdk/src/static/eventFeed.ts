/**
 * The client of the store's event feed for the static site's coordinator: the events of the
 * store after a cursor, read through the admin GraphQL API (`webhooksQuery.eventFeedCursor`,
 * `webhooksQuery.eventFeed`) as a service user of the store. Its access token comes from its
 * refresh token and is renewed before it expires. Server only.
 */
import type { StaticEventEnvelope } from './events';

/** Codes of the feed's `userErrors`. */
export type EventFeedErrorCode =
  | 'CURSOR_EXPIRED'
  | 'CURSOR_INVALID'
  | 'TOPICS_EMPTY'
  | 'TOPIC_UNKNOWN'
  | 'TOPICS_DUPLICATE'
  | 'LIMIT_INVALID'
  | 'API_VERSION_UNSUPPORTED'
  | 'SINCE_INVALID'
  | 'ACCESS_DENIED'
  /** The session of the service user is over: a new refresh token is needed. */
  | 'UNAUTHENTICATED'
  /** The API answered otherwise than the contract. */
  | 'UNEXPECTED';

export class EventFeedError extends Error {
  constructor(
    readonly code: EventFeedErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'EventFeedError';
  }
}

export interface EventFeedEntry {
  cursor: string;
  topic: string;
  eventId: string;
  envelope: StaticEventEnvelope;
}

export interface EventFeedPage {
  entries: EventFeedEntry[];
  nextCursor: string;
  hasMore: boolean;
}

export interface EventFeedClient {
  /** The cursor of now, or of the first event not before `since`. */
  cursor(since?: Date): Promise<string>;
  /** Up to `first` (at most 500) events after `after`. */
  read(after: string, options?: { first?: number }): Promise<EventFeedPage>;
}

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

/** Access tokens of a refresh token (OAuth 2 `refresh_token` grant). */
export interface AccessTokenSource {
  token(): Promise<string>;
  /** The API refused the token: the next `token()` asks for a new one. */
  invalidate(): void;
}

/** Renewed this long before the token expires. */
const TOKEN_MARGIN_MS = 60_000;

/**
 * Access tokens of the service user's refresh token from the token endpoint of IAM. A refresh
 * token the endpoint rotates is handed to `onRefreshToken` to be kept.
 */
export function refreshTokenSource({
  tokenUrl,
  refreshToken,
  clientId,
  fetch: fetchImpl = fetch,
  now = Date.now,
  onRefreshToken,
}: {
  tokenUrl: string;
  refreshToken: string;
  clientId?: string;
  fetch?: FetchLike;
  now?: () => number;
  onRefreshToken?: (token: string) => void;
}): AccessTokenSource {
  let current = refreshToken;
  let cached: { token: string; expiresAt: number } | null = null;
  let pending: Promise<string> | null = null;

  const refresh = async (): Promise<string> => {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: current,
      ...(clientId ? { client_id: clientId } : {}),
    });
    const response = await fetchImpl(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const payload = (await response.json().catch(() => null)) as {
      access_token?: string;
      expires_in?: number;
      refresh_token?: string;
      error?: string;
    } | null;
    if (!response.ok || !payload?.access_token) {
      throw new EventFeedError(
        response.status === 400 || response.status === 401
          ? 'UNAUTHENTICATED'
          : 'UNEXPECTED',
        `The token endpoint answered ${response.status}${payload?.error ? ` (${payload.error})` : ''}`
      );
    }
    if (payload.refresh_token && payload.refresh_token !== current) {
      current = payload.refresh_token;
      onRefreshToken?.(current);
    }
    cached = {
      token: payload.access_token,
      expiresAt: now() + (payload.expires_in ?? 300) * 1000 - TOKEN_MARGIN_MS,
    };
    return cached.token;
  };

  return {
    token() {
      if (cached && cached.expiresAt > now())
        return Promise.resolve(cached.token);
      pending ??= refresh().finally(() => {
        pending = null;
      });
      return pending;
    },
    invalidate() {
      cached = null;
    },
  };
}

const USER_ERRORS = 'userErrors { code message }';

const CURSOR_QUERY = `query StaticEventFeedCursor($since: DateTime) {
  webhooksQuery { eventFeedCursor(since: $since) { cursor ${USER_ERRORS} } }
}`;

const FEED_QUERY = `query StaticEventFeed($topics: [String!]!, $after: String!, $first: Int, $apiVersion: String) {
  webhooksQuery {
    eventFeed(topics: $topics, after: $after, first: $first, apiVersion: $apiVersion) {
      entries { cursor topic eventId envelope }
      nextCursor
      hasMore
      ${USER_ERRORS}
    }
  }
}`;

interface UserError {
  code: string;
  message: string;
}

function throwUserErrors(errors: UserError[] | undefined): void {
  const [first] = errors ?? [];
  if (first) {
    throw new EventFeedError(first.code as EventFeedErrorCode, first.message);
  }
}

/** The client of the feed of one store. */
export function createEventFeedClient({
  adminGraphqlUrl,
  storeName,
  topics,
  apiVersion,
  auth,
  fetch: fetchImpl = fetch,
}: {
  adminGraphqlUrl: string;
  storeName: string;
  topics: readonly string[];
  apiVersion?: string;
  auth: AccessTokenSource;
  fetch?: FetchLike;
}): EventFeedClient {
  const request = async <T>(
    query: string,
    variables: Record<string, unknown>,
    retried = false
  ): Promise<T> => {
    const response = await fetchImpl(adminGraphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${await auth.token()}`,
        'x-store-name': storeName,
      },
      body: JSON.stringify({ query, variables }),
    });
    if (response.status === 401) {
      auth.invalidate();
      if (!retried) return request(query, variables, true);
      throw new EventFeedError(
        'UNAUTHENTICATED',
        'The admin API refused the token'
      );
    }
    const payload = (await response.json().catch(() => null)) as {
      data?: { webhooksQuery?: T };
      errors?: Array<{ message: string; extensions?: { code?: string } }>;
    } | null;
    const error = payload?.errors?.[0];
    if (error) {
      const code = error.extensions?.code;
      if (code === 'UNAUTHENTICATED' && !retried) {
        auth.invalidate();
        return request(query, variables, true);
      }
      throw new EventFeedError(
        code === 'UNAUTHENTICATED' || code === 'FORBIDDEN'
          ? code === 'FORBIDDEN'
            ? 'ACCESS_DENIED'
            : 'UNAUTHENTICATED'
          : 'UNEXPECTED',
        error.message
      );
    }
    if (!response.ok || !payload?.data?.webhooksQuery) {
      throw new EventFeedError(
        'UNEXPECTED',
        `The admin API answered ${response.status}`
      );
    }
    return payload.data.webhooksQuery;
  };

  return {
    async cursor(since) {
      const { eventFeedCursor } = await request<{
        eventFeedCursor: { cursor: string | null; userErrors?: UserError[] };
      }>(CURSOR_QUERY, { since: since?.toISOString() ?? null });
      throwUserErrors(eventFeedCursor.userErrors);
      if (!eventFeedCursor.cursor) {
        throw new EventFeedError('UNEXPECTED', 'The feed gave no cursor');
      }
      return eventFeedCursor.cursor;
    },
    async read(after, options = {}) {
      const { eventFeed } = await request<{
        eventFeed: {
          entries: Array<
            Omit<EventFeedEntry, 'envelope'> & { envelope: unknown }
          >;
          nextCursor: string;
          hasMore: boolean;
          userErrors?: UserError[];
        };
      }>(FEED_QUERY, {
        topics,
        after,
        first: options.first ?? 100,
        apiVersion: apiVersion ?? null,
      });
      throwUserErrors(eventFeed.userErrors);
      return {
        entries: eventFeed.entries.map((entry) => {
          const envelope =
            typeof entry.envelope === 'string'
              ? (JSON.parse(entry.envelope) as StaticEventEnvelope)
              : (entry.envelope as StaticEventEnvelope);
          return {
            ...entry,
            envelope: {
              ...envelope,
              id: envelope.id ?? entry.eventId,
              topic: envelope.topic ?? entry.topic,
            },
          };
        }),
        nextCursor: eventFeed.nextCursor,
        hasMore: eventFeed.hasMore,
      };
    },
  };
}
