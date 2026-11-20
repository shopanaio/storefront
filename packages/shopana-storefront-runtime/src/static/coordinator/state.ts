/**
 * The state of the static site's coordinator over its database: the index of pages and their
 * dependencies, the queue of jobs, the stale (`dirty`) pages, the hits, the leases of the jobs
 * of GitHub Actions, the queue of CDN purges and the cursor of the event feed. Every operation
 * is one transaction, so a crash between an answer of the feed and its commit only repeats
 * events, which the event log deduplicates.
 *
 * - An event's changes (`mapEventToChanges`) find pages through `page_deps`: the page of the
 *   entity itself and the most visited pages are queued at once (eager), the others are marked
 *   stale (dirty) and rendered when visited or swept; a lazy change (stock) only marks.
 * - One queued job per page (`(locale, target)`): another reason joins it, with the lower
 *   priority. A result rendered at `T` takes every queued job of its page created before `T`
 *   and clears a stale mark set before `T`.
 * - A job leased and not returned goes back to the queue; one failed or expired three times goes
 *   to `dead_jobs`, its page stays as it was, stale.
 */
import { randomUUID } from 'node:crypto';
import type { DatabaseSync, StatementSync } from 'node:sqlite';
import {
  changeInLocale,
  mapEventToChanges,
  STATIC_DEP_KINDS,
  type StaticChange,
  type StaticEventEnvelope,
  type StaticPageDep,
} from '@shopana/storefront-sdk/static';

/** A page of the results of a lease (`static run`). */
export interface LeaseResult {
  jobIds: number[];
  locale: string;
  path: string;
  route: string;
  ownerKey: string | null;
  outcome: 'published' | 'unchanged' | 'gone' | 'failed';
  htmlHash: string | null;
  dataHash: string | null;
  deps: StaticPageDep[];
  layout?: string[];
  validUntil: string | null;
  renderStartedAt: number;
  error?: string;
}

export interface CoordinatorSettings {
  /** Pages queued at once for an eager change besides the page of the entity itself. */
  eagerTop: number;
  /** Stale pages queued by one sweep. */
  sweepBatch: number;
  /** A sweep runs at most this often. */
  sweepIntervalMs: number;
  /** A job waits this long after its event: the caches of the API catch up. */
  readLagMs: number;
  /** A lease lives this long without a heartbeat. */
  leaseMs: number;
  /** A job that failed (or expired) this many times is dead. */
  maxAttempts: number;
  /** Purges are queued (a CDN caches the site: step B). */
  purge: boolean;
}

export const DEFAULT_COORDINATOR_SETTINGS: CoordinatorSettings = {
  eagerTop: 300,
  sweepBatch: 200,
  sweepIntervalMs: 5 * 60_000,
  readLagMs: 0,
  leaseMs: 3 * 60_000,
  maxAttempts: 3,
  purge: false,
};

/** Job priorities: lower first. */
export const PRIORITY = {
  /** The page of the entity an event is of, a full build, an operator's request. */
  own: 0,
  /** The most visited pages, a stale page someone opened. */
  popular: 1,
  /** A moment of change of the content, a page the site has not yet. */
  timer: 2,
  /** The background sweep of stale pages. */
  sweep: 3,
} as const;

/** The target of the job of a full build. */
export const FULL_TARGET = 'full';

/** Reasons kept with a job or a stale page. */
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
  api_id: string | null;
  route: string | null;
  request_id: string | null;
  last_error: string | null;
}

export interface PageRow {
  id: number;
  locale: string;
  path: string;
  route: string;
  owner_key: string | null;
  status: string;
  html_hash: string | null;
  data_hash: string | null;
  build_id: string;
  render_started_at: number;
  rendered_at: number;
  valid_until: number | null;
  dirty_since: number | null;
  dirty_reasons: string | null;
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
  path: string | null;
  apiId: string | null;
  route: string | null;
  htmlHash: string | null;
  dataHash: string | null;
}

export interface LeaseGrant {
  leaseId: string;
  mode: 'queue' | 'full';
  image: string | null;
  jobs: LeasedJob[];
  expiresAt: number;
}

/** What one batch of events did. */
export interface EventsApplied {
  events: number;
  duplicates: number;
  changes: number;
  eager: number;
  dirty: number;
  purged: number;
  full: boolean;
  unmapped: string[];
}

/** A reason of a job or a stale mark. */
interface Reason {
  topic: string;
  eventId?: string;
  depKey?: string;
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
  if (
    !reasons.some(
      (item) =>
        item.topic === reason.topic &&
        item.eventId === reason.eventId &&
        item.depKey === reason.depKey
    )
  ) {
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

  // The cursor of the event feed.

  cursor(): string | null {
    const row = this.sql(
      'SELECT cursor FROM event_cursor WHERE id = 1'
    ).get() as { cursor: string } | undefined;
    return row?.cursor ?? null;
  }

  setCursor(cursor: string): void {
    this.sql(
      'INSERT INTO event_cursor (id, cursor, updated_at) VALUES (1, ?, ?) ' +
        'ON CONFLICT (id) DO UPDATE SET cursor = excluded.cursor, updated_at = excluded.updated_at'
    ).run(cursor, this.now());
  }

  cursorUpdatedAt(): number | null {
    const row = this.sql(
      'SELECT updated_at FROM event_cursor WHERE id = 1'
    ).get() as { updated_at: number } | undefined;
    return row?.updated_at ?? null;
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
    apiId?: string | null;
    route?: string | null;
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
          'api_id = COALESCE(?, api_id), route = COALESCE(?, route), request_id = COALESCE(?, request_id) WHERE id = ?'
      ).run(
        Math.min(existing.priority, job.priority),
        withReason(existing.reasons, job.reason),
        Math.min(existing.not_before, notBefore),
        job.apiId ?? null,
        job.route ?? null,
        job.requestId ?? null,
        existing.id
      );
      return existing.id;
    }
    const result = this.sql(
      'INSERT INTO jobs (locale, target, priority, reasons, created_at, not_before, state, api_id, route, request_id) ' +
        "VALUES (?, ?, ?, ?, ?, ?, 'queued', ?, ?, ?)"
    ).run(
      job.locale,
      job.target,
      job.priority,
      withReason(null, job.reason),
      now,
      notBefore,
      job.apiId ?? null,
      job.route ?? null,
      job.requestId ?? null
    );
    return Number(result.lastInsertRowid);
  }

  /** Queues a full build: it takes every job queued before it. */
  enqueueFull(reason: Reason, requestId?: string): number {
    return this.enqueue({
      locale: '',
      target: FULL_TARGET,
      priority: PRIORITY.own,
      reason,
      requestId,
    });
  }

  /** Marks a page stale (if it is not yet), with one more reason. */
  markDirty(pageId: number, reason: Reason): void {
    const row = this.sql('SELECT dirty_reasons FROM pages WHERE id = ?').get(
      pageId
    ) as { dirty_reasons: string | null } | undefined;
    if (!row) return;
    this.sql(
      'UPDATE pages SET dirty_since = COALESCE(dirty_since, ?), dirty_reasons = ? WHERE id = ?'
    ).run(this.now(), withReason(row.dirty_reasons, reason), pageId);
  }

  /** Queued jobs that would make a dispatch (the sweep's never do), ready now. */
  readyJobs(): { total: number; dispatchable: number; full: boolean } {
    const now = this.now();
    const row = this.sql(
      'SELECT COUNT(*) AS total, SUM(CASE WHEN priority < ? THEN 1 ELSE 0 END) AS dispatchable, ' +
        "SUM(CASE WHEN target = ? THEN 1 ELSE 0 END) AS full FROM jobs WHERE state = 'queued' AND not_before <= ?"
    ).get(PRIORITY.sweep, FULL_TARGET, now) as {
      total: number;
      dispatchable: number | null;
      full: number | null;
    };
    return {
      total: row.total,
      dispatchable: row.dispatchable ?? 0,
      full: (row.full ?? 0) > 0,
    };
  }

  /** When the oldest queued job that makes a dispatch was queued. */
  oldestDispatchable(): number | null {
    const row = this.sql(
      "SELECT MIN(created_at) AS at FROM jobs WHERE state = 'queued' AND priority < ?"
    ).get(PRIORITY.sweep) as { at: number | null };
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

  /** Ids of the pages queued at once for an eager change: the most visited and the homes. */
  private eagerPages(): Set<number> {
    const rows = this.sql(
      "SELECT id FROM pages WHERE status = 'published' ORDER BY hits_7d DESC, id LIMIT ?"
    ).all(this.settings.eagerTop) as Array<{ id: number }>;
    const homes = this.sql(
      "SELECT id FROM pages WHERE status = 'published' AND route = 'home'"
    ).all() as Array<{ id: number }>;
    return new Set([...rows, ...homes].map((row) => row.id));
  }

  /** Pages a change reaches through their dependencies. */
  private pagesOf(change: StaticChange): Array<PageRow & { dep_key: string }> {
    if (!change.key || change.aspects === 0 || change.kinds.length === 0)
      return [];
    const kinds = JSON.stringify(change.kinds);
    const rows =
      change.key === '*'
        ? (this.sql(
            'SELECT p.*, d.dep_key FROM page_deps d JOIN pages p ON p.id = d.page_id ' +
              "WHERE d.kind IN (SELECT value FROM json_each(?)) AND (d.aspects & ?) != 0 AND p.status = 'published'"
          ).all(kinds, change.aspects) as unknown as Array<
            PageRow & { dep_key: string }
          >)
        : (this.sql(
            'SELECT p.*, d.dep_key FROM page_deps d JOIN pages p ON p.id = d.page_id ' +
              "WHERE d.dep_key = ? AND d.kind IN (SELECT value FROM json_each(?)) AND (d.aspects & ?) != 0 AND p.status = 'published'"
          ).all(change.key, kinds, change.aspects) as unknown as Array<
            PageRow & { dep_key: string }
          >);
    const seen = new Set<number>();
    return rows.filter((row) => {
      if (seen.has(row.id) || !changeInLocale(change, row.locale)) return false;
      seen.add(row.id);
      return true;
    });
  }

  // Events.

  /**
   * Applies a page of the event feed in one transaction: each new event's changes, the log,
   * the cursor after them.
   */
  applyEvents(
    entries: ReadonlyArray<{
      eventId: string;
      topic: string;
      envelope: StaticEventEnvelope;
    }>,
    nextCursor: string
  ): EventsApplied {
    return this.transaction(() => {
      const applied: EventsApplied = {
        events: 0,
        duplicates: 0,
        changes: 0,
        eager: 0,
        dirty: 0,
        purged: 0,
        full: false,
        unmapped: [],
      };
      const eager = this.eagerPages();
      for (const entry of entries) {
        const known = this.sql(
          'SELECT 1 FROM event_log WHERE event_id = ?'
        ).get(entry.eventId);
        if (known) {
          applied.duplicates += 1;
          continue;
        }
        const changes = mapEventToChanges({
          ...entry.envelope,
          id: entry.envelope.id ?? entry.eventId,
          topic: entry.envelope.topic ?? entry.topic,
        });
        if (changes.length === 0) applied.unmapped.push(entry.topic);
        const counts = { eager: 0, dirty: 0, purged: 0 };
        for (const change of changes) {
          const result = this.applyChange(
            change,
            {
              topic: entry.topic,
              eventId: entry.eventId,
            },
            eager
          );
          counts.eager += result.eager;
          counts.dirty += result.dirty;
          counts.purged += result.purged;
          applied.full ||= result.full;
        }
        const occurred = Date.parse(entry.envelope.occurredAt ?? '');
        this.sql(
          'INSERT INTO event_log (event_id, topic, occurred_at, received_at, changes, eager, dirty, purged) ' +
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(
          entry.eventId,
          entry.topic,
          Number.isFinite(occurred) ? occurred : null,
          this.now(),
          changes.length,
          counts.eager,
          counts.dirty,
          counts.purged
        );
        applied.events += 1;
        applied.changes += changes.length;
        applied.eager += counts.eager;
        applied.dirty += counts.dirty;
        applied.purged += counts.purged;
      }
      this.setCursor(nextCursor);
      return applied;
    });
  }

  /** One change: the page of its entity, the pages of its dependencies, its purges. */
  applyChange(
    change: StaticChange,
    reason: Reason,
    eager: ReadonlySet<number> = this.eagerPages()
  ): { eager: number; dirty: number; purged: number; full: boolean } {
    const counts = { eager: 0, dirty: 0, purged: 0, full: false };
    const notBefore = this.now() + this.settings.readLagMs;
    if (this.settings.purge) {
      for (const tag of change.purgeTags ?? []) {
        const inserted = this.sql(
          'INSERT INTO purge_queue (tag, enqueued_at) VALUES (?, ?) ON CONFLICT (tag) DO NOTHING'
        ).run(tag, this.now());
        counts.purged += Number(inserted.changes);
      }
    }
    if (change.full) {
      this.enqueueFull(reason);
      counts.full = true;
      return counts;
    }
    // An entity of the layout of every page: every page changes.
    if (
      change.key &&
      change.key !== '*' &&
      change.kinds.includes(STATIC_DEP_KINDS.entity) &&
      this.sql('SELECT 1 FROM layout_deps WHERE dep_key = ?').get(change.key)
    ) {
      this.enqueueFull({ ...reason, depKey: change.key });
      counts.full = true;
      return counts;
    }

    const queued = new Set<number>();
    if (change.own && !change.lazy) {
      const { owner, id, route } = change.own;
      const pages = (
        this.sql(
          "SELECT * FROM pages WHERE owner_key = ? AND status = 'published'"
        ).all(owner) as unknown as PageRow[]
      ).filter((page) => changeInLocale(change, page.locale));
      for (const page of pages) {
        queued.add(page.id);
        // By its owner: the render finds its address again (a new handle) or takes it away.
        this.enqueue({
          locale: page.locale,
          target: `owner:${owner}`,
          priority: PRIORITY.own,
          reason: { ...reason, depKey: owner },
          notBefore,
          apiId: id,
          route,
        });
        counts.eager += 1;
      }
      if (pages.length === 0 && !change.gone) {
        // A page the site has not yet (a new product): in every language.
        for (const locale of this.locales()) {
          if (!changeInLocale(change, locale)) continue;
          this.enqueue({
            locale,
            target: `owner:${owner}`,
            priority: PRIORITY.own,
            reason: { ...reason, depKey: owner },
            notBefore,
            apiId: id,
            route,
          });
          counts.eager += 1;
        }
      }
    }

    for (const page of this.pagesOf(change)) {
      if (queued.has(page.id)) continue;
      const pageReason = { ...reason, depKey: page.dep_key };
      if (!change.lazy && eager.has(page.id)) {
        this.enqueue({
          locale: page.locale,
          target: `path:${page.path}`,
          priority: PRIORITY.popular,
          reason: pageReason,
          notBefore,
        });
        counts.eager += 1;
      } else {
        this.markDirty(page.id, pageReason);
        counts.dirty += 1;
      }
    }
    return counts;
  }

  // Hits.

  /**
   * The report of a server (or the CDN's worker): hits counted by day; a hit of a stale page
   * queues it; a miss of a page the site has not queues its address.
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
        if (page.dirty_since !== null && page.status === 'published') {
          this.enqueue({
            locale: page.locale,
            target: `path:${page.path}`,
            priority: PRIORITY.popular,
            reason: { topic: 'hit' },
          });
          queued += 1;
        }
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

  /** `hits_7d` from the hits of the last 7 days; older hits, events and dead jobs go. */
  recomputeHits(): void {
    this.transaction(() => {
      const today = Math.floor(this.now() / DAY_MS);
      this.sql(
        'UPDATE pages SET hits_7d = COALESCE((SELECT SUM(hits) FROM page_hits h WHERE h.page_id = pages.id AND h.day > ?), 0)'
      ).run(today - HITS_DAYS);
      this.sql('DELETE FROM page_hits WHERE day <= ?').run(
        today - HITS_DAYS - 1
      );
      this.sql('DELETE FROM event_log WHERE received_at < ?').run(
        this.now() - 30 * DAY_MS
      );
      this.sql('DELETE FROM dead_jobs WHERE died_at < ?').run(
        this.now() - 30 * DAY_MS
      );
    });
  }

  // Timers and the sweep.

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

  /**
   * The background sweep: when nothing is queued and nothing leased, at most every
   * `sweepIntervalMs`, the most visited stale pages are queued with the lowest priority. Its
   * jobs never make a dispatch: a run made for other jobs, or one running, takes them.
   */
  sweep(): number {
    return this.transaction(() => {
      const now = this.now();
      const last = Number(this.getSetting('last_sweep') ?? 0);
      if (now - last < this.settings.sweepIntervalMs) return 0;
      const busy = this.sql(
        "SELECT (SELECT COUNT(*) FROM jobs WHERE state = 'queued') + (SELECT COUNT(*) FROM leases WHERE state = 'active') AS n"
      ).get() as { n: number };
      if (busy.n > 0) return 0;
      const rows = this.sql(
        "SELECT id, locale, path FROM pages WHERE dirty_since IS NOT NULL AND status = 'published' ORDER BY hits_7d DESC, dirty_since LIMIT ?"
      ).all(this.settings.sweepBatch) as Array<{
        id: number;
        locale: string;
        path: string;
      }>;
      for (const row of rows) {
        this.enqueue({
          locale: row.locale,
          target: `path:${row.path}`,
          priority: PRIORITY.sweep,
          reason: { topic: 'sweep' },
        });
      }
      this.setSetting('last_sweep', String(now));
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
        const page = job.target.startsWith('path:')
          ? this.page(job.locale, job.target.slice('path:'.length))
          : ((this.sql(
              'SELECT * FROM pages WHERE owner_key = ? AND locale = ? ORDER BY rendered_at DESC LIMIT 1'
            ).get(job.target.slice('owner:'.length), job.locale) as
              | PageRow
              | undefined) ?? null);
        leased.push({
          id: job.id,
          locale: job.locale,
          target: job.target,
          path:
            page?.status === 'published'
              ? page.path
              : job.target.startsWith('path:')
                ? job.target.slice('path:'.length)
                : null,
          apiId: job.api_id,
          route: job.route ?? page?.route ?? null,
          htmlHash: page?.html_hash ?? null,
          dataHash: page?.data_hash ?? null,
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
        'UPDATE pages SET route = ?, owner_key = COALESCE(?, owner_key), status = ?, html_hash = ?, data_hash = ?, ' +
          'build_id = ?, render_started_at = ?, rendered_at = ?, valid_until = ? WHERE id = ?'
      ).run(
        result.route,
        result.ownerKey,
        status,
        status === 'gone' ? null : (result.htmlHash ?? existing.html_hash),
        status === 'gone' ? null : (result.dataHash ?? existing.data_hash),
        lease.image ?? existing.build_id,
        result.renderStartedAt,
        now,
        Number.isFinite(validUntil) ? validUntil : null,
        pageId
      );
    } else {
      if (status === 'gone') return;
      const inserted = this.sql(
        'INSERT INTO pages (locale, path, route, owner_key, status, html_hash, data_hash, build_id, render_started_at, rendered_at, valid_until) ' +
          'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(
        result.locale,
        result.path,
        result.route,
        result.ownerKey,
        status,
        result.htmlHash,
        result.dataHash,
        lease.image ?? '',
        result.renderStartedAt,
        now,
        Number.isFinite(validUntil) ? validUntil : null
      );
      pageId = Number(inserted.lastInsertRowid);
    }
    this.sql('DELETE FROM page_deps WHERE page_id = ?').run(pageId);
    if (status === 'published') {
      const insert = this.sql(
        'INSERT INTO page_deps (dep_key, kind, aspects, page_id) VALUES (?, ?, ?, ?) ' +
          'ON CONFLICT (dep_key, page_id) DO UPDATE SET aspects = aspects | excluded.aspects'
      );
      for (const dep of result.deps)
        insert.run(dep.key, dep.kind, dep.aspects, pageId);
      const layout = this.sql(
        'INSERT INTO layout_deps (dep_key, seen_at) VALUES (?, ?) ON CONFLICT (dep_key) DO UPDATE SET seen_at = excluded.seen_at'
      );
      for (const key of result.layout ?? []) layout.run(key, now);
    }
    // A change after the render started is not in the page: its mark stays.
    this.sql(
      'UPDATE pages SET dirty_since = NULL, dirty_reasons = NULL WHERE id = ? AND dirty_since < ?'
    ).run(pageId, result.renderStartedAt);
    // Jobs of the page queued before the render started are done by it.
    this.sql(
      "DELETE FROM jobs WHERE state = 'queued' AND locale = ? AND created_at < ? AND (target = ? OR target = ?)"
    ).run(
      result.locale,
      result.renderStartedAt,
      `path:${result.path}`,
      `owner:${result.ownerKey ?? ''}`
    );
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
   * see into `gone`, clears the stale marks set before it and takes the jobs queued before it.
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
            "UPDATE pages SET status = 'gone', html_hash = NULL, data_hash = NULL WHERE id = ?"
          ).run(page.id);
          this.sql('DELETE FROM page_deps WHERE page_id = ?').run(page.id);
        }
        this.sql(
          'UPDATE pages SET dirty_since = NULL, dirty_reasons = NULL WHERE dirty_since < ?'
        ).run(lease.created_at);
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
      "SELECT reasons FROM jobs WHERE state = 'queued' AND priority < ?"
    ).all(PRIORITY.sweep) as Array<{ reasons: string }>;
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

  // Purges.

  /** The oldest tags of the purge queue. */
  purgeBatch(limit: number): string[] {
    return (
      this.sql(
        'SELECT tag FROM purge_queue ORDER BY enqueued_at, tag LIMIT ?'
      ).all(limit) as Array<{
        tag: string;
      }>
    ).map((row) => row.tag);
  }

  purged(tags: readonly string[]): void {
    this.transaction(() => {
      for (const tag of tags)
        this.sql('DELETE FROM purge_queue WHERE tag = ?').run(tag);
    });
  }

  purgeFailed(tags: readonly string[]): void {
    this.transaction(() => {
      for (const tag of tags) {
        this.sql(
          'UPDATE purge_queue SET attempts = attempts + 1 WHERE tag = ?'
        ).run(tag);
      }
      // A tag that keeps failing is dropped: the CDN's copy expires by its `s-maxage`.
      this.sql('DELETE FROM purge_queue WHERE attempts >= 10').run();
    });
  }

  // Operator requests.

  /** A build an operator, a deploy or a cron asks for: its jobs carry its request id. */
  requestBuild(request: {
    mode: 'full' | 'paths' | 'entities';
    paths?: readonly string[];
    entities?: readonly string[];
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
            priority: PRIORITY.own,
            reason,
            requestId,
          });
          jobs += 1;
        }
      } else {
        for (const key of request.entities ?? []) {
          const pages = this.sql(
            'SELECT DISTINCT p.id, p.locale, p.path FROM pages p LEFT JOIN page_deps d ON d.page_id = p.id ' +
              "WHERE p.status = 'published' AND (p.owner_key = ? OR d.dep_key = ?)"
          ).all(key, key) as Array<{
            id: number;
            locale: string;
            path: string;
          }>;
          for (const page of pages) {
            if (locales && !locales.includes(page.locale)) continue;
            this.enqueue({
              locale: page.locale,
              target: `path:${page.path}`,
              priority: PRIORITY.own,
              reason: { ...reason, depKey: key },
              requestId,
            });
            jobs += 1;
          }
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

  /** The pages that depend on a key: dirty or not, and why. */
  pagesByDep(key: string): Array<Record<string, unknown>> {
    return (
      this.sql(
        'SELECT p.locale, p.path, p.route, p.status, p.hits_7d, p.dirty_since, p.dirty_reasons, d.kind, d.aspects ' +
          'FROM page_deps d JOIN pages p ON p.id = d.page_id WHERE d.dep_key = ? ORDER BY p.hits_7d DESC LIMIT 1000'
      ).all(key) as Array<Record<string, unknown>>
    ).map((row) => ({
      ...row,
      dirty_reasons: parseReasons(row.dirty_reasons as string | null),
    }));
  }

  /** The figures of the status endpoint. */
  status(): Record<string, unknown> {
    const count = (sql: string, ...params: Array<string | number>) =>
      (this.sql(sql).get(...params) as { n: number }).n;
    const cursorAt = this.cursorUpdatedAt();
    return {
      pages: count(
        "SELECT COUNT(*) AS n FROM pages WHERE status = 'published'"
      ),
      gone: count("SELECT COUNT(*) AS n FROM pages WHERE status = 'gone'"),
      dirty: count(
        'SELECT COUNT(*) AS n FROM pages WHERE dirty_since IS NOT NULL'
      ),
      deps: count('SELECT COUNT(*) AS n FROM page_deps'),
      layoutDeps: count('SELECT COUNT(*) AS n FROM layout_deps'),
      queued: count("SELECT COUNT(*) AS n FROM jobs WHERE state = 'queued'"),
      leased: count("SELECT COUNT(*) AS n FROM jobs WHERE state = 'leased'"),
      deadJobs: count('SELECT COUNT(*) AS n FROM dead_jobs'),
      activeLeases: count(
        "SELECT COUNT(*) AS n FROM leases WHERE state = 'active'"
      ),
      purgeQueue: count('SELECT COUNT(*) AS n FROM purge_queue'),
      cursor: this.cursor(),
      cursorUpdatedAt: cursorAt,
      cursorLagMs: cursorAt === null ? null : this.now() - cursorAt,
      currentImage: this.getSetting('current_image'),
      lastFullBuild: Number(this.getSetting('last_full_build') ?? 0) || null,
      lastDispatch: this.lastDispatch(),
      lastEvent:
        (this.sql(
          'SELECT event_id, topic, received_at FROM event_log ORDER BY received_at DESC LIMIT 1'
        ).get() as Record<string, unknown> | undefined) ?? null,
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
