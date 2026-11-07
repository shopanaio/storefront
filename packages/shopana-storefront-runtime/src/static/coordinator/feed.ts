/**
 * The loop of the event feed: the events after the cursor, applied with the new cursor in one
 * transaction; the next page at once while there is more, else after `pollMs`. An expired or
 * invalid cursor builds the whole site from a new one; a session that is over waits for a new
 * token without losing events (while the cursor lives).
 */
import {
  EventFeedError,
  type EventFeedClient,
} from '@shopana/storefront-sdk/static';
import type { CoordinatorState, EventsApplied } from './state';

export interface FeedStatus {
  /** The last error of the feed, until a read succeeds. */
  error: { code: string; message: string; at: number } | null;
  lastReadAt: number | null;
}

export class EventFeedLoop {
  readonly status: FeedStatus = { error: null, lastReadAt: null };
  private timer: ReturnType<typeof setTimeout> | null = null;
  private stopped = true;

  constructor(
    private readonly state: CoordinatorState,
    private readonly feed: EventFeedClient,
    private readonly options: {
      pollMs: number;
      pageSize?: number;
      now?: () => number;
      logger?: Pick<Console, 'info' | 'warn' | 'error'>;
      /** A full build was queued (after an applied page): snapshot and the like. */
      onApplied?: (applied: EventsApplied) => void;
    }
  ) {}

  private get logger() {
    return this.options.logger ?? console;
  }

  /**
   * One read: resolves with whether more events wait. Without a cursor (a new index) the feed
   * starts now and the site is built whole.
   */
  async pollOnce(): Promise<boolean> {
    const now = this.options.now ?? Date.now;
    let cursor = this.state.cursor();
    try {
      if (!cursor) {
        cursor = await this.feed.cursor();
        this.state.transaction(() => {
          this.state.setCursor(cursor!);
          this.state.enqueueFull({ topic: 'feed:start' });
        });
        this.logger.info(
          '[static-coordinator] the feed starts now: a full build is queued'
        );
      }
      const page = await this.feed.read(cursor, {
        first: this.options.pageSize ?? 100,
      });
      const applied = this.state.applyEvents(page.entries, page.nextCursor);
      this.status.error = null;
      this.status.lastReadAt = now();
      if (applied.events > 0) {
        this.logger.info(
          `[static-coordinator] ${applied.events} events: ${applied.eager} at once, ` +
            `${applied.dirty} stale, ${applied.purged} purges${applied.full ? ', a full build' : ''}`
        );
      }
      for (const topic of new Set(applied.unmapped)) {
        this.logger.info(
          `[static-coordinator] ${topic}: no rule, nothing to do`
        );
      }
      this.options.onApplied?.(applied);
      return page.hasMore;
    } catch (error) {
      const code = error instanceof EventFeedError ? error.code : 'UNEXPECTED';
      const message = error instanceof Error ? error.message : String(error);
      this.status.error = { code, message, at: now() };
      if (code === 'CURSOR_EXPIRED' || code === 'CURSOR_INVALID') {
        const fresh = await this.feed.cursor();
        this.state.transaction(() => {
          this.state.setCursor(fresh);
          this.state.enqueueFull({ topic: `feed:${code}` });
        });
        this.logger.warn(
          `[static-coordinator] ${code}: a full build from a new cursor`
        );
        return true;
      }
      this.logger.error(
        `[static-coordinator] the event feed failed (${code}): ${message}`
      );
      throw error;
    }
  }

  start(): void {
    this.stopped = false;
    const run = async () => {
      if (this.stopped) return;
      let delay = this.options.pollMs;
      try {
        if (await this.pollOnce()) delay = 0;
      } catch (error) {
        // A session that is over waits longer: a new refresh token is the operator's.
        delay =
          error instanceof EventFeedError && error.code === 'UNAUTHENTICATED'
            ? 30_000
            : Math.max(this.options.pollMs, 5_000);
      }
      if (!this.stopped) this.timer = setTimeout(run, delay);
    };
    void run();
  }

  stop(): void {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
  }
}
