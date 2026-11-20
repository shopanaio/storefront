/**
 * The state of the static site's coordinator over its database: the index of pages, the queue
 * of jobs, the hits and the leases of the jobs of GitHub Actions. Every operation is one
 * transaction. Pages are queued by a build asked for (an operator, a deploy, the nightly run),
 * by a miss of a page the site has not yet and by the moment a page's content changes at
 * (`validUntil`); the store's events queue nothing.
 *
 * - One queued job per page (`(locale, target)`): another reason joins it, with the lower
 *   priority. A result rendered at `T` takes every queued job of its page created before `T`.
 * - A job leased and not returned goes back to the queue; one failed or expired three times goes
 *   to `dead_jobs`, its page stays as it was.
 */
import { randomUUID } from 'node:crypto';
import type { DatabaseSync, StatementSync } from 'node:sqlite';

/** A page of the results of a lease (`static run`). */
export interface LeaseResult {
  jobIds: number[];
  locale: string;
  path: string;
  route: string;
  outcome: 'published' | 'unchanged' | 'gone' | 'failed';
  htmlHash: string | null;
  validUntil: string | null;
  renderStartedAt: number;
  error?: string;
}

export interface CoordinatorSettings {
  /** A lease lives this long without a heartbeat. */
  leaseMs: number;
  /** A job that failed (or expired) this many times is dead. */
  maxAttempts: number;
}

export const DEFAULT_COORDINATOR_SETTINGS: CoordinatorSettings = {
  leaseMs: 3 * 60_000,
  maxAttempts: 3,
};

/** Job priorities: lower first. */
export const PRIORITY = {
  /** A full build, an operator's request. */
  request: 0,
  /** A moment of change of the content, a page the site has not yet. */
  timer: 1,
} as const;

/** The target of the job of a full build. */
export const FULL_TARGET = 'full';

/** Reasons kept with a job. */
const MAX_REASONS = 20;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Hits of a page are summed over this many days for `hits_7d`. */
const HITS_DAYS = 7;

export interface JobRow {
  id: number;
  locale: string;
  target: string;
  priority: number;
  reasons: string;
  created_at: number;
  not_before: number;
  state: string;
  lease_id: string | null;
  attempts: number;
  request_id: string | null;
  last_error: string | null;
}

export interface PageRow {
  id: number;
  locale: string;
  path: string;
  route: string;
  status: string;
  html_hash: string | null;
  build_id: string;
  render_started_at: number;
  rendered_at: number;
  valid_until: number | null;
  hits_7d: number;
}

export interface LeaseRow {
  id: string;
  request_id: string | null;
  run_id: string | null;
  run_attempt: number | null;
  mode: string;
  image: string | null;
  created_at: number;
  heartbeat_at: number;
  expires_at: number;
  state: string;
}

/** A job as a lease hands it to `static run`. */
export interface LeasedJob {
  id: number;
  locale: string;
  target: string;
  path: string;
  htmlHash: string | null;
}

export interface LeaseGrant {
  leaseId: string;
  mode: 'queue' | 'full';
  image: string | null;
  jobs: LeasedJob[];
  expiresAt: number;
}

/** A reason of a job. */
interface Reason {
  topic: string;
}

const parseReasons = (text: string | null): Reason[] => {
  if (!text) return [];
  try {
    return JSON.parse(text) as Reason[];
  } catch {
    return [];
  }
};

/** Reasons with one more, the oldest dropped past the limit. */
function withReason(text: string | null, reason: Reason): string {
  const reasons = parseReasons(text);
  if (!reasons.some((item) => item.topic === reason.topic)) {
    reasons.push(reason);
  }
  return JSON.stringify(reasons.slice(-MAX_REASONS));
}

/** The address of a store key (`uk/products/x/index.html` → `/uk/products/x`). */
export function pathOfStaticKey(key: string): string | null {
  if (key === 'index.html') return '/';
  if (!key.endsWith('/index.html')) return null;
  const path = `/${key.slice(0, -'/index.html'.length)}`;
  return path.includes('//') || path.includes('/__') ? null : path;
}

export class CoordinatorState {
  readonly settings: CoordinatorSettings;
  private readonly statements = new Map<string, StatementSync>();
  private depth = 0;

  constructor(
    readonly db: DatabaseSync,
    settings: Partial<CoordinatorSettings> = {},
    private readonly now: () => number = Date.now
  ) {
    this.settings = { ...DEFAULT_COORDINATOR_SETTINGS, ...settings };
  }

  /** A statement of `sql`, prepared once. */
  private sql(sql: string): StatementSync {
    let statement = this.statements.get(sql);
    if (!statement) {
      statement = this.db.prepare(sql);
      this.statements.set(sql, statement);
    }
    return statement;
  }

  /** Runs `work` in a transaction (a savepoint inside another). */
  transaction<T>(work: () => T): T {
    const savepoint = `sp${this.depth}`;
    this.db.exec(
      this.depth === 0 ? 'BEGIN IMMEDIATE' : `SAVEPOINT ${savepoint}`
    );
    this.depth += 1;
    try {
      const result = work();
      this.depth -= 1;
      this.db.exec(this.depth === 0 ? 'COMMIT' : `RELEASE ${savepoint}`);
      return result;
    } catch (error) {
      this.depth -= 1;
      this.db.exec(
        this.depth === 0
          ? 'ROLLBACK'
          : `ROLLBACK TO ${savepoint}; RELEASE ${savepoint}`
      );
      throw error;
    }
  }

  // Settings.

  getSetting(key: string): string | null {
    const row = this.sql('SELECT value FROM settings WHERE key = ?').get(
      key
    ) as { value: string } | undefined;
    return row?.value ?? null;
  }

  setSetting(key: string, value: string | null): void {
    if (value === null) {
      this.sql('DELETE FROM settings WHERE key = ?').run(key);
      return;
    }
    this.sql(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value'
    ).run(key, value);
  }

  // Jobs.

  /**
   * Queues a job of a page, or joins the one queued for it: one reason more, the lower
   * priority, the earlier start.
   */
  enqueue(job: {
    locale: string;
    target: string;
    priority: number;
    reason: Reason;
    notBefore?: number;
    requestId?: string | null;
  }): number {
    const now = this.now();
    const notBefore = job.notBefore ?? now;
    const existing = this.sql(
      "SELECT id, priority, reasons, not_before FROM jobs WHERE locale = ? AND target = ? AND state = 'queued'"
    ).get(job.locale, job.target) as
      | { id: number; priority: number; reasons: string; not_before: number }
      | undefined;
    if (existing) {
      this.sql(
        'UPDATE jobs SET priority = ?, reasons = ?, not_before = ?, ' +
          'request_id = COALESCE(?, request_id) WHERE id = ?'
      ).run(
        Math.min(existing.priority, job.priority),
        withReason(existing.reasons, job.reason),
        Math.min(existing.not_before, notBefore),
        job.requestId ?? null,
        existing.id
      );
      return existing.id;
    }
    const result = this.sql(
      'INSERT INTO jobs (locale, target, priority, reasons, created_at, not_before, state, request_id) ' +
        "VALUES (?, ?, ?, ?, ?, ?, 'queued', ?)"
    ).run(
      job.locale,
      job.target,
      job.priority,
      withReason(null, job.reason),
      now,
      notBefore,
      job.requestId ?? null
    );
    return Number(result.lastInsertRowid);
  }

  /** Queues a full build: it takes every job queued before it. */
  enqueueFull(reason: Reason, requestId?: string): number {
    return this.enqueue({
      locale: '',
      target: FULL_TARGET,
      priority: PRIORITY.request,
      reason,
      requestId,
    });
  }

  /** Queued jobs ready now. */
  readyJobs(): { total: number; full: boolean } {
    const now = this.now();
    const row = this.sql(
      'SELECT COUNT(*) AS total, ' +
        "SUM(CASE WHEN target = ? THEN 1 ELSE 0 END) AS full FROM jobs WHERE state = 'queued' AND not_before <= ?"
    ).get(FULL_TARGET, now) as { total: number; full: number | null };
    return { total: row.total, full: (row.full ?? 0) > 0 };
  }

  /** When the oldest queued job was queued. */
  oldestQueued(): number | null {
    const row = this.sql(
      "SELECT MIN(created_at) AS at FROM jobs WHERE state = 'queued'"
    ).get() as { at: number | null };
    return row.at;
  }

  // Pages.

  page(locale: string, path: string): PageRow | null {
    return (
      (this.sql('SELECT * FROM pages WHERE locale = ? AND path = ?').get(
        locale,
        path
      ) as PageRow | undefined) ?? null
    );
  }

  pageByPath(path: string): PageRow | null {
    return (
      (this.sql('SELECT * FROM pages WHERE path = ? ORDER BY id LIMIT 1').get(
        path
      ) as PageRow | undefined) ?? null
    );
  }

  /** The URL segments of the languages the index knows. */
  locales(): string[] {
    const known = (
      this.sql(
        'SELECT DISTINCT locale FROM pages ORDER BY locale'
      ).all() as Array<{
        locale: string;
      }>
    ).map((row) => row.locale);
    const configured = this.getSetting('locales');
    const listed = configured ? (JSON.parse(configured) as string[]) : [];
    return [...new Set([...listed, ...known])].sort();
  }

  /** The language of addresses without a locale segment. */
  defaultLocale(): string {
    return this.getSetting('default_locale') ?? this.locales()[0] ?? '';
  }

  // Hits.

  /**
   * The report of a server (or the CDN's worker): hits counted by day; a miss of a page the
   * site has not queues its address.
   */
  recordHits(
    hits: Readonly<Record<string, number>>,
    misses: readonly string[] = []
  ): { counted: number; queued: number } {
    return this.transaction(() => {
      const now = this.now();
      const day = Math.floor(now / DAY_MS);
      const locales = new Set(
        this.locales().map((locale) => locale.toLowerCase())
      );
      const defaultLocale = this.defaultLocale();
      const localeOf = (path: string) => {
        const first = path.split('/')[1]?.toLowerCase() ?? '';
        return locales.has(first) ? first : defaultLocale;
      };
      let counted = 0;
      let queued = 0;
      for (const [key, count] of Object.entries(hits)) {
        const path = pathOfStaticKey(key);
        const n = Math.floor(Number(count));
        if (!path || !Number.isFinite(n) || n <= 0) continue;
        const page = this.pageByPath(path);
        if (!page) continue;
        this.sql(
          'INSERT INTO page_hits (page_id, day, hits) VALUES (?, ?, ?) ' +
            'ON CONFLICT (page_id, day) DO UPDATE SET hits = hits + excluded.hits'
        ).run(page.id, day, n);
        counted += 1;
      }
      for (const key of misses) {
        const path = pathOfStaticKey(key);
        if (!path) continue;
        const page = this.pageByPath(path);
        if (page && page.status === 'published') continue;
        this.enqueue({
          locale: page?.locale ?? localeOf(path),
          target: `path:${path}`,
          priority: PRIORITY.timer,
          reason: { topic: 'miss' },
        });
        queued += 1;
      }
      return { counted, queued };
    });
  }

  /** `hits_7d` from the hits of the last 7 days; older hits and dead jobs go. */
  recomputeHits(): void {
    this.transaction(() => {
      const today = Math.floor(this.now() / DAY_MS);
      this.sql(
        'UPDATE pages SET hits_7d = COALESCE((SELECT SUM(hits) FROM page_hits h WHERE h.page_id = pages.id AND h.day > ?), 0)'
      ).run(today - HITS_DAYS);
      this.sql('DELETE FROM page_hits WHERE day <= ?').run(
        today - HITS_DAYS - 1
      );
      this.sql('DELETE FROM dead_jobs WHERE died_at < ?').run(
        this.now() - 30 * DAY_MS
      );
    });
  }

  // Timers.

  /** Pages whose content changes by itself now (a collection's window): queued. */
  enqueueExpired(): number {
    return this.transaction(() => {
      const rows = this.sql(
        "SELECT id, locale, path FROM pages WHERE valid_until IS NOT NULL AND valid_until <= ? AND status = 'published'"
      ).all(this.now()) as Array<{ id: number; locale: string; path: string }>;
      for (const row of rows) {
        this.enqueue({
          locale: row.locale,
          target: `path:${row.path}`,
          priority: PRIORITY.timer,
          reason: { topic: 'validUntil' },
        });
        this.sql('UPDATE pages SET valid_until = NULL WHERE id = ?').run(
          row.id
        );
      }
      return rows.length;
    });
  }

  // Leases.

  /** Leases without a heartbeat for too long: their jobs go back to the queue (or die). */
  expireLeases(): number {
    return this.transaction(() => {
      const expired = this.sql(
        "SELECT id FROM leases WHERE state = 'active' AND expires_at < ?"
      ).all(this.now()) as Array<{ id: string }>;
      for (const { id } of expired) {
        this.sql("UPDATE leases SET state = 'expired' WHERE id = ?").run(id);
        this.returnJobs(id, 'the lease expired');
      }
      return expired.length;
    });
  }

  /** Jobs of a lease not returned: queued again, or dead after too many attempts. */
  private returnJobs(leaseId: string, error: string): void {
    const jobs = this.sql(
      "SELECT * FROM jobs WHERE lease_id = ? AND state = 'leased'"
    ).all(leaseId) as unknown as JobRow[];
    for (const job of jobs) this.requeue(job, error);
  }

  /** A job back in the queue (joined with one queued for its page), or dead. */
  private requeue(job: JobRow, error: string): void {
    if (job.attempts >= this.settings.maxAttempts) {
      this.sql(
        'INSERT INTO dead_jobs (locale, target, reasons, last_error, died_at) VALUES (?, ?, ?, ?, ?)'
      ).run(job.locale, job.target, job.reasons, error, this.now());
      this.sql('DELETE FROM jobs WHERE id = ?').run(job.id);
      return;
    }
    const queued = this.sql(
      "SELECT id, reasons, priority FROM jobs WHERE locale = ? AND target = ? AND state = 'queued'"
    ).get(job.locale, job.target) as
      | { id: number; reasons: string; priority: number }
      | undefined;
    if (queued) {
      let reasons = queued.reasons;
      for (const reason of parseReasons(job.reasons))
        reasons = withReason(reasons, reason);
      this.sql(
        'UPDATE jobs SET reasons = ?, priority = ?, attempts = MAX(attempts, ?) WHERE id = ?'
      ).run(
        reasons,
        Math.min(queued.priority, job.priority),
        job.attempts,
        queued.id
      );
      this.sql('DELETE FROM jobs WHERE id = ?').run(job.id);
      return;
    }
    this.sql(
      "UPDATE jobs SET state = 'queued', lease_id = NULL, last_error = ?, not_before = ? WHERE id = ?"
    ).run(error, this.now() + 30_000 * job.attempts, job.id);
  }

  /**
   * A lease for a run: the full build when one is queued, else up to `capacity` ready jobs by
   * priority. The first lease of a run claims its dispatch. No ready job: a lease without jobs
   * (the run ends).
   */
  lease(request: {
    requestId?: string | null;
    runId?: string | null;
    runAttempt?: number | null;
    capacity?: number;
  }): LeaseGrant {
    this.expireLeases();
    return this.transaction(() => {
      const now = this.now();
      if (request.requestId) {
        this.sql(
          "UPDATE dispatches SET state = 'claimed', claimed_at = COALESCE(claimed_at, ?), run_id = COALESCE(?, run_id) WHERE request_id = ?"
        ).run(now, request.runId ?? null, request.requestId);
      }
      const id = randomUUID();
      const image = this.getSetting('current_image');
      const full = this.sql(
        "SELECT * FROM jobs WHERE state = 'queued' AND target = ? AND not_before <= ? LIMIT 1"
      ).get(FULL_TARGET, now) as JobRow | undefined;
      const capacity = Math.max(0, Math.min(request.capacity ?? 500, 500));
      const jobs = full
        ? [full]
        : capacity === 0
          ? []
          : (this.sql(
              "SELECT * FROM jobs WHERE state = 'queued' AND not_before <= ? AND target != ? ORDER BY priority, created_at LIMIT ?"
            ).all(now, FULL_TARGET, capacity) as unknown as JobRow[]);
      const mode = full ? 'full' : 'queue';
      this.sql(
        'INSERT INTO leases (id, request_id, run_id, run_attempt, mode, image, created_at, heartbeat_at, expires_at, state) ' +
          "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')"
      ).run(
        id,
        request.requestId ?? null,
        request.runId ?? null,
        request.runAttempt ?? null,
        mode,
        image,
        now,
        now,
        now + this.settings.leaseMs
      );
      const leased: LeasedJob[] = [];
      for (const job of jobs) {
        this.sql(
          "UPDATE jobs SET state = 'leased', lease_id = ?, attempts = attempts + 1 WHERE id = ?"
        ).run(id, job.id);
        if (job.target === FULL_TARGET) continue;
        const path = job.target.slice('path:'.length);
        const page = this.page(job.locale, path);
        leased.push({
          id: job.id,
          locale: job.locale,
          target: job.target,
          path,
          htmlHash: page?.html_hash ?? null,
        });
      }
      return {
        leaseId: id,
        mode,
        image,
        jobs: leased,
        expiresAt: now + this.settings.leaseMs,
      };
    });
  }

  activeLease(id: string): LeaseRow | null {
    return (
      (this.sql("SELECT * FROM leases WHERE id = ? AND state = 'active'").get(
        id
      ) as LeaseRow | undefined) ?? null
    );
  }

  /** Renews a lease; false when it is gone (`410`). */
  heartbeat(id: string): boolean {
    this.expireLeases();
    const now = this.now();
    const result = this.sql(
      "UPDATE leases SET heartbeat_at = ?, expires_at = ? WHERE id = ? AND state = 'active'"
    ).run(now, now + this.settings.leaseMs, id);
    return Number(result.changes) > 0;
  }

  /** The results of a lease, a transaction a page; false when the lease is gone. */
  recordResults(leaseId: string, results: readonly LeaseResult[]): boolean {
    const lease = this.activeLease(leaseId);
    if (!lease) return false;
    for (const result of results) {
      this.transaction(() => this.recordResult(lease, result));
    }
    return true;
  }

  private recordResult(lease: LeaseRow, result: LeaseResult): void {
    const now = this.now();
    const jobs = result.jobIds.length
      ? (this.sql(
          "SELECT * FROM jobs WHERE id IN (SELECT value FROM json_each(?)) AND lease_id = ? AND state = 'leased'"
        ).all(JSON.stringify(result.jobIds), lease.id) as unknown as JobRow[])
      : [];
    if (result.outcome === 'failed') {
      for (const job of jobs) this.requeue(job, result.error ?? 'failed');
      return;
    }
    for (const job of jobs)
      this.sql('DELETE FROM jobs WHERE id = ?').run(job.id);

    const existing = this.page(result.locale, result.path);
    const validUntil = result.validUntil ? Date.parse(result.validUntil) : null;
    const status = result.outcome === 'gone' ? 'gone' : 'published';
    let pageId: number;
    if (existing) {
      pageId = existing.id;
      this.sql(
        'UPDATE pages SET route = ?, status = ?, html_hash = ?, ' +
          'build_id = ?, render_started_at = ?, rendered_at = ?, valid_until = ? WHERE id = ?'
      ).run(
        result.route,
        status,
        status === 'gone' ? null : (result.htmlHash ?? existing.html_hash),
        lease.image ?? existing.build_id,
        result.renderStartedAt,
        now,
        Number.isFinite(validUntil) ? validUntil : null,
        pageId
      );
    } else {
      if (status === 'gone') return;
      const inserted = this.sql(
        'INSERT INTO pages (locale, path, route, status, html_hash, build_id, render_started_at, rendered_at, valid_until) ' +
          'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(
        result.locale,
        result.path,
        result.route,
        status,
        result.htmlHash,
        lease.image ?? '',
        result.renderStartedAt,
        now,
        Number.isFinite(validUntil) ? validUntil : null
      );
      pageId = Number(inserted.lastInsertRowid);
    }
    // Jobs of the page queued before the render started are done by it.
    this.sql(
      "DELETE FROM jobs WHERE state = 'queued' AND locale = ? AND created_at < ? AND target = ?"
    ).run(result.locale, result.renderStartedAt, `path:${result.path}`);
    // The language of addresses without a locale segment.
    const first = result.path.split('/')[1]?.toLowerCase() ?? '';
    if (
      first !== result.locale.toLowerCase() &&
      !this.getSetting('default_locale')
    ) {
      this.setSetting('default_locale', result.locale);
    }
  }

  /**
   * The end of a lease: jobs not returned go back. A full build turns every page it did not
   * see into `gone` and takes the jobs queued before it.
   */
  complete(
    leaseId: string,
    body: {
      fullBuild?: boolean;
      seenPages?: ReadonlyArray<{ locale: string; path: string }>;
    }
  ): boolean {
    const lease = this.activeLease(leaseId);
    if (!lease) return false;
    this.transaction(() => {
      const now = this.now();
      if (body.fullBuild && lease.mode === 'full') {
        const seen = new Set(
          (body.seenPages ?? []).map((page) => `${page.locale}|${page.path}`)
        );
        const pages = this.sql(
          "SELECT id, locale, path FROM pages WHERE status = 'published'"
        ).all() as Array<{ id: number; locale: string; path: string }>;
        for (const page of pages) {
          if (seen.has(`${page.locale}|${page.path}`)) continue;
          this.sql(
            "UPDATE pages SET status = 'gone', html_hash = NULL WHERE id = ?"
          ).run(page.id);
        }
        this.sql(
          "DELETE FROM jobs WHERE state = 'queued' AND created_at < ?"
        ).run(lease.created_at);
        this.sql('DELETE FROM jobs WHERE lease_id = ? AND target = ?').run(
          leaseId,
          FULL_TARGET
        );
        this.setSetting('last_full_build', String(now));
      }
      this.returnJobs(leaseId, 'not returned by its run');
      this.sql(
        "UPDATE leases SET state = 'completed', heartbeat_at = ? WHERE id = ?"
      ).run(now, leaseId);
    });
    return true;
  }

  // Dispatches.

  lastDispatch(): {
    request_id: string;
    dispatched_at: number;
    claimed_at: number | null;
    state: string;
  } | null {
    return (
      (this.sql(
        'SELECT * FROM dispatches ORDER BY dispatched_at DESC LIMIT 1'
      ).get() as
        | {
            request_id: string;
            dispatched_at: number;
            claimed_at: number | null;
            state: string;
          }
        | undefined) ?? null
    );
  }

  recordDispatch(requestId: string, mode: string, reason: string): void {
    this.sql(
      "INSERT INTO dispatches (request_id, mode, reason, dispatched_at, state) VALUES (?, ?, ?, ?, 'dispatched')"
    ).run(requestId, mode, reason, this.now());
  }

  markDispatchStale(requestId: string): void {
    this.sql("UPDATE dispatches SET state = 'stale' WHERE request_id = ?").run(
      requestId
    );
  }

  /** The active lease that started first, with when its run claimed its dispatch. */
  activeRun(): { lease: LeaseRow; runStartedAt: number } | null {
    const lease = this.sql(
      "SELECT * FROM leases WHERE state = 'active' ORDER BY created_at LIMIT 1"
    ).get() as LeaseRow | undefined;
    if (!lease) return null;
    const started = this.sql(
      'SELECT MIN(created_at) AS at FROM leases WHERE run_id IS ? AND run_id IS NOT NULL'
    ).get(lease.run_id) as { at: number | null };
    return { lease, runStartedAt: started.at ?? lease.created_at };
  }

  /** What the jobs queued and leased say, for the dispatch's reason. */
  queueSummary(): string {
    const rows = this.sql(
      "SELECT reasons FROM jobs WHERE state = 'queued'"
    ).all() as Array<{ reasons: string }>;
    const counts = new Map<string, number>();
    for (const row of rows) {
      const topic = parseReasons(row.reasons)[0]?.topic ?? 'job';
      counts.set(topic, (counts.get(topic) ?? 0) + 1);
    }
    return [...counts]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => `${topic}×${count}`)
      .join(', ');
  }

  // Operator requests.

  /** A build an operator, a deploy or a cron asks for: its jobs carry its request id. */
  requestBuild(request: {
    mode: 'full' | 'paths';
    paths?: readonly string[];
    locales?: readonly string[];
    reason?: string;
    image?: string;
  }): { requestId: string; jobs: number } {
    return this.transaction(() => {
      const requestId = `b-${randomUUID()}`;
      const reason = { topic: request.reason ?? `build:${request.mode}` };
      this.sql(
        'INSERT INTO build_requests (request_id, mode, reason, image, created_at) VALUES (?, ?, ?, ?, ?)'
      ).run(
        requestId,
        request.mode,
        request.reason ?? null,
        request.image ?? null,
        this.now()
      );
      if (request.image) this.setSetting('current_image', request.image);
      let jobs = 0;
      const locales = request.locales?.length ? request.locales : null;
      if (request.mode === 'full') {
        this.enqueueFull(reason, requestId);
        jobs += 1;
      } else if (request.mode === 'paths') {
        const known = new Set(
          this.locales().map((locale) => locale.toLowerCase())
        );
        const defaultLocale = this.defaultLocale();
        for (const path of request.paths ?? []) {
          const first = path.split('/')[1]?.toLowerCase() ?? '';
          const locale = known.has(first) ? first : defaultLocale;
          if (locales && !locales.includes(locale)) continue;
          this.enqueue({
            locale,
            target: `path:${path}`,
            priority: PRIORITY.request,
            reason,
            requestId,
          });
          jobs += 1;
        }
      }
      return { requestId, jobs };
    });
  }

  buildRequest(requestId: string): {
    request: Record<string, unknown> | null;
    jobs: Array<Record<string, unknown>>;
    dispatch: Record<string, unknown> | null;
  } {
    const request =
      (this.sql('SELECT * FROM build_requests WHERE request_id = ?').get(
        requestId
      ) as Record<string, unknown> | undefined) ?? null;
    const jobs = this.sql(
      'SELECT id, locale, target, priority, state, lease_id, attempts, created_at FROM jobs WHERE request_id = ?'
    ).all(requestId) as Array<Record<string, unknown>>;
    const leases = jobs.map((job) => job.lease_id).filter(Boolean);
    const lease = leases.length
      ? (this.sql('SELECT request_id, run_id FROM leases WHERE id = ?').get(
          leases[0] as string
        ) as { request_id: string | null; run_id: string | null } | undefined)
      : undefined;
    const dispatch =
      (this.sql('SELECT * FROM dispatches WHERE request_id = ?').get(
        lease?.request_id ?? requestId
      ) as Record<string, unknown> | undefined) ?? null;
    return {
      request,
      jobs,
      dispatch: dispatch ?? (lease ? { run_id: lease.run_id } : null),
    };
  }

  /** The figures of the status endpoint. */
  status(): Record<string, unknown> {
    const count = (sql: string, ...params: Array<string | number>) =>
      (this.sql(sql).get(...params) as { n: number }).n;
    return {
      pages: count(
        "SELECT COUNT(*) AS n FROM pages WHERE status = 'published'"
      ),
      gone: count("SELECT COUNT(*) AS n FROM pages WHERE status = 'gone'"),
      queued: count("SELECT COUNT(*) AS n FROM jobs WHERE state = 'queued'"),
      leased: count("SELECT COUNT(*) AS n FROM jobs WHERE state = 'leased'"),
      deadJobs: count('SELECT COUNT(*) AS n FROM dead_jobs'),
      activeLeases: count(
        "SELECT COUNT(*) AS n FROM leases WHERE state = 'active'"
      ),
      currentImage: this.getSetting('current_image'),
      lastFullBuild: Number(this.getSetting('last_full_build') ?? 0) || null,
      lastDispatch: this.lastDispatch(),
    };
  }

  /** After a restore from a snapshot: no run of the old process holds anything. */
  resetRuns(): void {
    this.transaction(() => {
      this.sql(
        "UPDATE leases SET state = 'expired' WHERE state = 'active'"
      ).run();
      const leased = this.sql(
        "SELECT * FROM jobs WHERE state = 'leased'"
      ).all() as unknown as JobRow[];
      for (const job of leased)
        this.requeue(
          {
            ...job,
            attempts: Math.min(job.attempts, this.settings.maxAttempts - 1),
          },
          'restored'
        );
      this.sql(
        "UPDATE dispatches SET state = 'stale' WHERE state = 'dispatched'"
      ).run();
    });
  }
}
