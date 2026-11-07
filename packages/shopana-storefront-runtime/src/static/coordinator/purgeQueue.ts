/**
 * The purge queue of the coordinator, sent within the CDN's limits: Cloudflare takes 5 purge
 * requests a minute with a burst of 25 and 100 tags a request (by its documentation; set by
 * `STATIC_PURGE_PER_MINUTE`, `STATIC_PURGE_BURST`). A queue growing faster waits: until its
 * purge or its `s-maxage`, the CDN answers the earlier version.
 */
import { PURGE_BATCH, PurgeRateLimited, type StaticPurger } from '../purge';
import type { CoordinatorState } from './state';

export interface PurgeLimits {
  perMinute: number;
  burst: number;
}

export const DEFAULT_PURGE_LIMITS: PurgeLimits = { perMinute: 5, burst: 25 };

export class PurgeQueue {
  private tokens: number;
  private refilledAt: number;
  private pausedUntil = 0;

  constructor(
    private readonly state: CoordinatorState,
    private readonly purger: StaticPurger,
    private readonly limits: PurgeLimits = DEFAULT_PURGE_LIMITS,
    private readonly now: () => number = Date.now,
    private readonly logger: Pick<Console, 'warn'> = console
  ) {
    this.tokens = limits.burst;
    this.refilledAt = now();
  }

  private refill(): void {
    const now = this.now();
    const earned = ((now - this.refilledAt) / 60_000) * this.limits.perMinute;
    this.tokens = Math.min(this.limits.burst, this.tokens + earned);
    this.refilledAt = now;
  }

  /** Sends what the limits allow now; resolves with the tags purged. */
  async tick(): Promise<number> {
    if (this.now() < this.pausedUntil) return 0;
    let purged = 0;
    for (;;) {
      this.refill();
      if (this.tokens < 1) return purged;
      const batch = this.state.purgeBatch(PURGE_BATCH);
      if (batch.length === 0) return purged;
      this.tokens -= 1;
      try {
        await this.purger.purge(batch);
        this.state.purged(batch);
        purged += batch.length;
      } catch (error) {
        if (error instanceof PurgeRateLimited) {
          this.pausedUntil = this.now() + error.retryAfterMs;
          this.tokens = 0;
        } else {
          this.state.purgeFailed(batch);
          this.logger.warn(
            `[static-coordinator] purge failed: ${String(error)}`
          );
        }
        return purged;
      }
    }
  }
}
