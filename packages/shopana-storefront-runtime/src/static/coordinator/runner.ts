/**
 * The renders of the coordinator, on its own node with the theme build of its image: when jobs
 * are queued it leases them to itself and renders them as `static build` and `static render`
 * do, in worker threads, publishing only what changed and purging it (step B).
 *
 * - The first job after a quiet time starts a 20 s wait (later jobs do not extend it), so one
 *   render takes a burst of misses or an operator's paths.
 * - One render at a time: jobs queued meanwhile wait for the next.
 * - A full build queued takes the whole site and every job queued before it.
 * - The lease is renewed while its pages render; a render that dies leaves its jobs to the
 *   lease's expiry, which queues them again.
 */
import {
  buildStaticSite,
  renderStaticPages,
  type StaticBuildOptions,
  type StaticPageRequest,
  type StaticPageResult,
} from '../builder';
import type { CoordinatorState, LeasedJob, LeaseResult } from './state';

export interface RunnerSettings {
  /** How long the first job waits for others. */
  delayMs: number;
  /** Jobs in one render. */
  capacity: number;
  /** How often the lease of a render is renewed. */
  heartbeatMs: number;
}

export const DEFAULT_RUNNER_SETTINGS: RunnerSettings = {
  delayMs: 20_000,
  capacity: 500,
  heartbeatMs: 60_000,
};

/** What a tick did. */
export type RunnerDecision =
  | 'idle'
  | 'accumulating'
  | 'running'
  | 'rendered'
  | 'off';

/** Results go to the index this many at a time. */
const RESULTS_BATCH = 200;

/** The request of a job: its address. */
export function jobRequest(job: LeasedJob): StaticPageRequest {
  return { locale: job.locale, path: job.path, jobIds: [job.id] };
}

const toLeaseResult = (
  result: StaticPageResult,
  jobIds: number[] = result.jobIds ?? []
): LeaseResult => ({
  jobIds,
  locale: result.locale,
  path: result.path,
  route: result.route,
  outcome: result.outcome,
  htmlHash: result.htmlHash,
  validUntil: result.validUntil,
  renderStartedAt: result.renderStartedAt,
  ...(result.error ? { error: result.error } : {}),
});

export class LocalRunner {
  readonly settings: RunnerSettings;
  private firstSeenAt: number | null = null;
  private running = false;
  private last: {
    at: number;
    mode: string;
    pages: number;
    failed: number;
  } | null = null;

  constructor(
    private readonly state: CoordinatorState,
    /** What the renders build with; null: the coordinator renders nothing. */
    private readonly build: Omit<StaticBuildOptions, 'onPage'> | null,
    settings: Partial<RunnerSettings> = {},
    private readonly now: () => number = Date.now,
    private readonly logger: Pick<Console, 'info' | 'warn' | 'error'> = console,
    /** A full build ended. */
    private readonly onFullBuild: () => void = () => {}
  ) {
    this.settings = { ...DEFAULT_RUNNER_SETTINGS, ...settings };
  }

  get status() {
    return {
      render: Boolean(this.build),
      running: this.running,
      last: this.last,
    };
  }

  /** One decision: a render of the jobs queued when the wait allows it. */
  async tick(): Promise<RunnerDecision> {
    if (!this.build) return 'off';
    if (this.running) return 'running';
    const ready = this.state.readyJobs();
    if (ready.total === 0) {
      this.firstSeenAt = null;
      return 'idle';
    }
    const now = this.now();
    this.firstSeenAt ??= now;
    if (!ready.full && now - this.firstSeenAt < this.settings.delayMs) {
      return 'accumulating';
    }
    this.firstSeenAt = null;
    this.running = true;
    try {
      await this.render(this.build);
    } finally {
      this.running = false;
    }
    return 'rendered';
  }

  private async render(build: Omit<StaticBuildOptions, 'onPage'>) {
    const reason = this.state.queueSummary() || 'queue';
    const lease = this.state.lease({ capacity: this.settings.capacity });
    if (lease.mode !== 'full' && lease.jobs.length === 0) {
      this.state.complete(lease.leaseId, {});
      return;
    }
    this.logger.info(`[static-coordinator] render ${lease.mode}: ${reason}`);
    const heartbeat = setInterval(
      () => this.state.heartbeat(lease.leaseId),
      this.settings.heartbeatMs
    );
    heartbeat.unref?.();
    try {
      if (lease.mode === 'full') {
        const pending: LeaseResult[] = [];
        const seenPages: Array<{ locale: string; path: string }> = [];
        const flush = () => {
          const batch = pending.splice(0);
          if (batch.length > 0) this.state.recordResults(lease.leaseId, batch);
        };
        const report = await buildStaticSite({
          ...build,
          onPage: (result) => {
            if (result.outcome !== 'gone') {
              seenPages.push({ locale: result.locale, path: result.path });
            }
            pending.push(toLeaseResult(result, []));
            if (pending.length >= RESULTS_BATCH) flush();
          },
        });
        flush();
        this.state.complete(lease.leaseId, { fullBuild: true, seenPages });
        this.last = {
          at: this.now(),
          mode: 'full',
          pages: report.pages,
          failed: report.failed.length,
        };
        this.onFullBuild();
        return;
      }
      const report = await renderStaticPages({
        ...build,
        pages: lease.jobs.map(jobRequest),
      });
      const results = report.results.map((result) => toLeaseResult(result));
      for (let index = 0; index < results.length; index += RESULTS_BATCH) {
        this.state.recordResults(
          lease.leaseId,
          results.slice(index, index + RESULTS_BATCH)
        );
      }
      this.state.complete(lease.leaseId, {});
      this.last = {
        at: this.now(),
        mode: 'queue',
        pages: report.pages,
        failed: report.failed.length,
      };
    } catch (error) {
      // The jobs not returned go back to the queue (or die after their attempts).
      this.state.complete(lease.leaseId, {});
      this.logger.error(`[static-coordinator] render failed: ${String(error)}`);
    } finally {
      clearInterval(heartbeat);
    }
  }
}
