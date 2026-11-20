/**
 * When the coordinator starts a run of `static-site.yml`:
 *
 * - the first job after a quiet time starts a 20 s wait (later jobs do not extend it), so one
 *   run takes a burst of events;
 * - at least 60 s between two dispatches;
 * - one dispatch not yet claimed (by the first lease of its run) at a time; one unclaimed for
 *   10 minutes is stale and another goes;
 * - while a run holds a lease it takes the new jobs itself: a dispatch goes when it has ended,
 *   or when less than 3 minutes of its budget remain;
 * - the sweep's jobs never make a dispatch: a run made for other jobs takes them.
 */
import { randomBytes } from 'node:crypto';
import type { CoordinatorState } from './state';

export interface DispatchSettings {
  delayMs: number;
  minIntervalMs: number;
  staleMs: number;
  /** The budget of a run (`--budget`). */
  runBudgetMs: number;
  /** A run this close to the end of its budget takes no new jobs: another is dispatched. */
  budgetMarginMs: number;
}

export const DEFAULT_DISPATCH_SETTINGS: DispatchSettings = {
  delayMs: 20_000,
  minIntervalMs: 60_000,
  staleMs: 10 * 60_000,
  runBudgetMs: 35 * 60_000,
  budgetMarginMs: 3 * 60_000,
};

export type DispatchDecision =
  | 'idle'
  | 'accumulating'
  | 'too-soon'
  | 'unclaimed'
  | 'running'
  | 'dispatched'
  | 'failed';

/** Starts a run with its request id and reason. */
export type DispatchRun = (run: {
  requestId: string;
  mode: 'queue';
  reason: string;
}) => Promise<void>;

/** The request id of a dispatch: `d-<date>-<time>-<random>`. */
export function dispatchRequestId(now: number): string {
  const iso = new Date(now).toISOString();
  return `d-${iso.slice(0, 10).replace(/-/g, '')}-${iso.slice(11, 19).replace(/:/g, '')}-${randomBytes(2).toString('hex')}`;
}

export class Dispatcher {
  private readonly settings: DispatchSettings;
  /** When the first job after a quiet time (an empty queue) came. */
  private firstSeenAt: number | null = null;
  private running = false;

  constructor(
    private readonly state: CoordinatorState,
    private readonly run: DispatchRun | null,
    settings: Partial<DispatchSettings> = {},
    private readonly now: () => number = Date.now,
    private readonly logger: Pick<Console, 'info' | 'warn'> = console
  ) {
    this.settings = { ...DEFAULT_DISPATCH_SETTINGS, ...settings };
  }

  /** One decision: a dispatch when the rules allow it. */
  async tick(): Promise<DispatchDecision> {
    if (this.running) return 'running';
    const now = this.now();
    const ready = this.state.readyJobs();
    if (ready.dispatchable === 0) {
      this.firstSeenAt = null;
      return 'idle';
    }
    this.firstSeenAt ??= now;
    if (now - this.firstSeenAt < this.settings.delayMs) return 'accumulating';

    const last = this.state.lastDispatch();
    if (last && now - last.dispatched_at < this.settings.minIntervalMs) {
      return 'too-soon';
    }
    if (last?.state === 'dispatched') {
      if (now - last.dispatched_at < this.settings.staleMs) return 'unclaimed';
      this.state.markDispatchStale(last.request_id);
      this.logger.warn(
        `[static-coordinator] dispatch ${last.request_id} never claimed: stale`
      );
    }
    const active = this.state.activeRun();
    if (
      active &&
      now - active.runStartedAt <
        this.settings.runBudgetMs - this.settings.budgetMarginMs
    ) {
      return 'running';
    }
    if (!this.run) return 'idle';

    const requestId = dispatchRequestId(now);
    const reason = this.state.queueSummary() || 'queue';
    this.state.recordDispatch(requestId, 'queue', reason);
    this.running = true;
    try {
      await this.run({ requestId, mode: 'queue', reason });
      this.logger.info(
        `[static-coordinator] dispatched ${requestId}: ${reason}`
      );
      return 'dispatched';
    } catch (error) {
      this.state.markDispatchStale(requestId);
      this.logger.warn(
        `[static-coordinator] dispatch failed: ${String(error)}`
      );
      return 'failed';
    } finally {
      this.running = false;
    }
  }
}
