/**
 * `storefront-runtime static run`: a job of the static site's coordinator (`static coordinator`),
 * run by GitHub Actions in the theme's image. It takes jobs under a lease, renders them with
 * the builder, publishes only what changed, purges the tags of the pages it changed (step B)
 * and returns the results with what each page depends on, until the queue is empty or its
 * budget is spent. A lease of `mode: full` renders the whole site.
 *
 * Without a coordinator, `static run --events <file>` maps events of an NDJSON file to the
 * pages of a built site (their dependencies read from their data) and renders those: for the
 * development of the mapper and the aspects on real snapshots.
 */
import { readFile } from 'node:fs/promises';
import {
  changeReaches,
  changeInLocale,
  extractPageDeps,
  mapEventToChanges,
  type StaticEventEnvelope,
  type StaticPageDep,
} from '@shopana/storefront-sdk/static';
import {
  buildStaticSite,
  readManifest,
  renderStaticPages,
  type StaticBuildOptions,
  type StaticPageRequest,
  type StaticPageResult,
} from './builder';

/** The audience of the OIDC token of a job: what the coordinator accepts. */
export const COORDINATOR_AUDIENCE = 'shopana-static-coordinator';

/** A job of a lease. */
export interface CoordinatorJob {
  id: number;
  /** The URL segment of the language. */
  locale: string;
  /** `path:/products/x` or `owner:Product:<uuid>`. */
  target: string;
  /** The address the index has for the page, if any. */
  path: string | null;
  /** The API id of the entity of an `owner:` job. */
  apiId: string | null;
  /** The page type of an `owner:` job. */
  route: string | null;
  htmlHash: string | null;
  dataHash: string | null;
}

export interface CoordinatorLease {
  leaseId: string;
  mode: 'queue' | 'full' | 'paths';
  image: string | null;
  jobs: CoordinatorJob[];
  expiresAt: number;
}

/** A page of the results of a lease. */
export type CoordinatorResult = StaticPageResult & { jobIds: number[] };

export interface CoordinatorClient {
  lease(request: {
    requestId?: string;
    runId?: string;
    runAttempt?: number;
    capacity: number;
  }): Promise<CoordinatorLease>;
  /** False when the lease is gone (`410`): its jobs went back to the queue. */
  heartbeat(leaseId: string): Promise<boolean>;
  results(
    leaseId: string,
    results: readonly CoordinatorResult[]
  ): Promise<void>;
  complete(
    leaseId: string,
    body: {
      fullBuild?: boolean;
      seenPages?: Array<{ locale: string; path: string }>;
    }
  ): Promise<void>;
}

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

/** A bearer token for the coordinator. */
export type TokenSource = () => Promise<string>;

/**
 * The OIDC token of the GitHub Actions job (`id-token: write`), for the coordinator's
 * audience, renewed every 4 minutes; without one, `STATIC_OPERATOR_TOKEN` (a local run).
 */
export function jobTokenSource(
  env: Record<string, string | undefined>,
  fetchImpl: FetchLike = fetch,
  now: () => number = Date.now
): TokenSource {
  const url = env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const requestToken = env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  if (!url || !requestToken) {
    const operator = env.STATIC_OPERATOR_TOKEN?.trim();
    if (!operator) {
      throw new Error(
        'static run needs the OIDC token of GitHub Actions (permissions: id-token: write) or STATIC_OPERATOR_TOKEN'
      );
    }
    return async () => operator;
  }
  let cached: { token: string; at: number } | null = null;
  return async () => {
    if (cached && now() - cached.at < 4 * 60_000) return cached.token;
    const target = new URL(url);
    target.searchParams.set('audience', COORDINATOR_AUDIENCE);
    const response = await fetchImpl(target, {
      headers: { Authorization: `Bearer ${requestToken}` },
    });
    const payload = (await response.json().catch(() => null)) as {
      value?: string;
    } | null;
    if (!response.ok || !payload?.value) {
      throw new Error(`GitHub gave no OIDC token: ${response.status}`);
    }
    cached = { token: payload.value, at: now() };
    return payload.value;
  };
}

/** The client of a coordinator's lease API. */
export function createCoordinatorClient({
  url,
  token,
  fetch: fetchImpl = fetch,
}: {
  url: string;
  token: TokenSource;
  fetch?: FetchLike;
}): CoordinatorClient {
  const call = async (
    pathname: string,
    body: string,
    contentType = 'application/json'
  ) => {
    const response = await fetchImpl(new URL(pathname, url), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await token()}`,
        'Content-Type': contentType,
      },
      body,
    });
    return response;
  };
  const ensure = async (response: Response, what: string) => {
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(
        `The coordinator refused ${what}: ${response.status} ${text}`.trim()
      );
    }
  };
  return {
    async lease(request) {
      const response = await call(
        '/__builder/api/leases',
        JSON.stringify(request)
      );
      await ensure(response, 'a lease');
      return (await response.json()) as CoordinatorLease;
    },
    async heartbeat(leaseId) {
      const response = await call(
        `/__builder/api/leases/${encodeURIComponent(leaseId)}/heartbeat`,
        '{}'
      );
      if (response.status === 410) return false;
      await ensure(response, 'a heartbeat');
      return true;
    },
    async results(leaseId, results) {
      if (results.length === 0) return;
      const response = await call(
        `/__builder/api/leases/${encodeURIComponent(leaseId)}/results`,
        results.map((result) => JSON.stringify(result)).join('\n') + '\n',
        'application/x-ndjson'
      );
      await ensure(response, 'results');
    },
    async complete(leaseId, body) {
      const response = await call(
        `/__builder/api/leases/${encodeURIComponent(leaseId)}/complete`,
        JSON.stringify(body)
      );
      await ensure(response, 'the end of a lease');
    },
  };
}

/** The request of a job: an address, or the entity of an `owner:` job. */
export function jobRequest(job: CoordinatorJob): StaticPageRequest {
  if (job.target.startsWith('owner:')) {
    return {
      locale: job.locale,
      previousPath: job.path ?? undefined,
      owner: {
        key: job.target.slice('owner:'.length),
        id: job.apiId ?? '',
        route: job.route ?? '',
      },
      jobIds: [job.id],
    };
  }
  return {
    locale: job.locale,
    path: job.target.startsWith('path:')
      ? job.target.slice('path:'.length)
      : (job.path ?? ''),
    jobIds: [job.id],
  };
}

/** Results go to the coordinator this many at a time. */
const RESULTS_BATCH = 200;

/** The lease is renewed this often while its jobs render. */
const HEARTBEAT_MS = 60_000;

/** No new lease is taken this close to the end of the budget. */
const BUDGET_MARGIN_MS = 3 * 60_000;

export interface StaticRunOptions extends Omit<StaticBuildOptions, 'onPage'> {
  coordinator: CoordinatorClient;
  requestId?: string;
  runId?: string;
  runAttempt?: number;
  /** How long the job may take leases (`--budget 35m`). */
  budgetMs: number;
  /** Jobs in a lease. */
  capacity?: number;
}

export interface StaticRunReport {
  leases: number;
  pages: number;
  failed: number;
}

/** Takes leases and renders their jobs until the queue is empty or the budget is spent. */
export async function runStaticJobs(
  options: StaticRunOptions
): Promise<StaticRunReport> {
  const {
    coordinator,
    logger = console,
    now = () => new Date(),
    capacity = 500,
  } = options;
  const started = now().getTime();
  const report: StaticRunReport = { leases: 0, pages: 0, failed: 0 };
  let first = true;

  while (now().getTime() - started < options.budgetMs - BUDGET_MARGIN_MS) {
    const lease = await coordinator.lease({
      capacity,
      // The run tells which dispatch it is with its first lease only.
      ...(first
        ? {
            requestId: options.requestId,
            runId: options.runId,
            runAttempt: options.runAttempt,
          }
        : {}),
    });
    first = false;
    if (lease.mode !== 'full' && lease.jobs.length === 0) {
      await coordinator.complete(lease.leaseId, {});
      break;
    }
    report.leases += 1;
    let alive = true;
    const heartbeat = setInterval(() => {
      void coordinator
        .heartbeat(lease.leaseId)
        .then((ok) => {
          if (!ok) alive = false;
        })
        .catch((error: unknown) =>
          logger.warn(`[static] heartbeat failed: ${String(error)}`)
        );
    }, HEARTBEAT_MS);
    try {
      if (lease.mode === 'full') {
        const pending: CoordinatorResult[] = [];
        const seenPages: Array<{ locale: string; path: string }> = [];
        const sends: Array<Promise<void>> = [];
        const flush = () => {
          const batch = pending.splice(0);
          if (batch.length > 0)
            sends.push(coordinator.results(lease.leaseId, batch));
        };
        const build = await buildStaticSite({
          ...options,
          onPage: (result) => {
            if (result.outcome !== 'gone') {
              seenPages.push({ locale: result.locale, path: result.path });
            }
            pending.push({ ...result, jobIds: [] });
            if (pending.length >= RESULTS_BATCH) flush();
          },
        });
        flush();
        await Promise.all(sends);
        report.pages += build.pages;
        report.failed += build.failed.length;
        if (!alive) {
          logger.warn(
            '[static] the lease of the full build expired before its end'
          );
          continue;
        }
        await coordinator.complete(lease.leaseId, {
          fullBuild: true,
          seenPages,
        });
        continue;
      }
      const rendered = await renderStaticPages({
        ...options,
        pages: lease.jobs.map(jobRequest),
      });
      const results = rendered.results.map((result) => ({
        ...result,
        jobIds: result.jobIds ?? [],
      }));
      for (let index = 0; index < results.length; index += RESULTS_BATCH) {
        await coordinator.results(
          lease.leaseId,
          results.slice(index, index + RESULTS_BATCH)
        );
      }
      report.pages += rendered.pages;
      report.failed += rendered.failed.length;
      if (alive) await coordinator.complete(lease.leaseId, {});
    } finally {
      clearInterval(heartbeat);
    }
  }
  logger.info(
    `[static] run: ${report.leases} leases, ${report.pages} pages, ${report.failed} failed`
  );
  return report;
}

/** The events of an NDJSON file: one envelope per line. */
export async function readEventsFile(
  file: string
): Promise<StaticEventEnvelope[]> {
  return (await readFile(file, 'utf8'))
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as StaticEventEnvelope);
}

/** What a run of events would do to the pages of a site. */
export interface StaticEventsPlan {
  /** Pages rendered at once (their own page and every page an eager change reaches). */
  eager: Array<{ locale: string; path: string; reasons: string[] }>;
  /** Pages a lazy change only marks stale. */
  dirty: Array<{ locale: string; path: string; reasons: string[] }>;
  /** Events that build the whole site. */
  full: string[];
  /** Tags of the CDN to purge. */
  purgeTags: string[];
  /** Entities whose own page the site has not yet. */
  owners: Array<{ key: string; id: string; route: string }>;
}

/**
 * What events change in a built site, without a coordinator: the dependencies of its pages read
 * from their data, the changes of each event matched against them.
 */
export async function planStaticEvents(
  options: Pick<StaticBuildOptions, 'store'> & {
    events: readonly StaticEventEnvelope[];
    defaultLocale?: string;
  }
): Promise<StaticEventsPlan> {
  const { manifest } = await readManifest(options.store);
  if (!manifest) throw new Error(`${options.store.url} has no static site`);
  const pages: Array<{
    locale: string;
    path: string;
    deps: StaticPageDep[];
    owner: string | null;
  }> = [];
  const defaultLocale = options.defaultLocale ?? manifest.locales[0];
  for (const file of Object.values(manifest.files)) {
    if (file.kind !== 'page' || !file.path || !file.data) continue;
    const read = await options.store.read(file.data);
    if (read.status !== 'found') continue;
    const locale = file.locale ?? defaultLocale;
    const { deps, owner } = extractPageDeps(
      JSON.parse(read.body.toString('utf8')),
      {
        translated: locale !== defaultLocale,
      }
    );
    pages.push({ locale, path: file.path, deps, owner });
  }
  const eager = new Map<
    string,
    { locale: string; path: string; reasons: string[] }
  >();
  const dirty = new Map<
    string,
    { locale: string; path: string; reasons: string[] }
  >();
  const plan: StaticEventsPlan = {
    eager: [],
    dirty: [],
    full: [],
    purgeTags: [],
    owners: [],
  };
  const add = (
    into: typeof eager,
    page: { locale: string; path: string },
    reason: string
  ) => {
    const id = `${page.locale}|${page.path}`;
    const entry = into.get(id) ?? {
      locale: page.locale,
      path: page.path,
      reasons: [],
    };
    if (!entry.reasons.includes(reason)) entry.reasons.push(reason);
    into.set(id, entry);
  };
  for (const event of options.events) {
    for (const change of mapEventToChanges(event)) {
      plan.purgeTags.push(...(change.purgeTags ?? []));
      if (change.full) {
        plan.full.push(event.topic);
        continue;
      }
      const reason = `${event.topic}:${change.key}`;
      if (change.own && !change.lazy) {
        const owned = pages.filter(
          (page) =>
            page.owner === change.own!.owner &&
            changeInLocale(change, page.locale)
        );
        for (const page of owned) add(eager, page, reason);
        if (owned.length === 0 && !change.gone) {
          plan.owners.push({
            key: change.own.owner,
            id: change.own.id,
            route: change.own.route,
          });
        }
      }
      for (const page of pages) {
        if (!page.deps.some((dep) => changeReaches(change, dep, page.locale)))
          continue;
        add(change.lazy ? dirty : eager, page, reason);
      }
    }
  }
  for (const id of eager.keys()) dirty.delete(id);
  plan.eager = [...eager.values()];
  plan.dirty = [...dirty.values()];
  plan.purgeTags = [...new Set(plan.purgeTags)];
  return plan;
}

/** Renders the pages events change in a built site (`static run --events`). */
export async function runStaticEvents(
  options: StaticBuildOptions & { events: readonly StaticEventEnvelope[] }
): Promise<StaticEventsPlan> {
  const { logger = console } = options;
  const plan = await planStaticEvents(options);
  logger.info(
    `[static] events: ${plan.eager.length} pages at once, ${plan.dirty.length} stale, ` +
      `${plan.owners.length} new pages, ${plan.full.length ? `a full build (${plan.full.join(', ')})` : 'no full build'}, ` +
      `purge ${plan.purgeTags.join(', ') || 'nothing'}`
  );
  for (const page of [...plan.eager, ...plan.dirty]) {
    logger.info(
      `[static]   ${page.locale} ${page.path}: ${page.reasons.join(', ')}`
    );
  }
  if (plan.full.length > 0) {
    await buildStaticSite(options);
    return plan;
  }
  const { manifest } = await readManifest(options.store);
  const locales = manifest?.locales ?? [];
  await renderStaticPages({
    ...options,
    pages: [
      ...[...plan.eager, ...plan.dirty].map((page) => ({
        locale: page.locale,
        path: page.path,
      })),
      ...plan.owners.flatMap((owner) =>
        locales.map((locale) => ({ locale, owner }))
      ),
    ],
  });
  return plan;
}
