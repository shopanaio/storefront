/**
 * `storefront-runtime static run`: a job of the static site's coordinator (`static coordinator`),
 * run by GitHub Actions in the theme's image. It takes jobs under a lease, renders them with
 * the builder, publishes only what changed, purges the tags of the pages it changed (step B)
 * and returns the results, until the queue is empty or its budget is spent. A lease of
 * `mode: full` renders the whole site.
 */
import {
  buildStaticSite,
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
  /** `path:/products/x`. */
  target: string;
  /** The address of the page. */
  path: string;
  htmlHash: string | null;
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

/** The request of a job: its address. */
export function jobRequest(job: CoordinatorJob): StaticPageRequest {
  return { locale: job.locale, path: job.path, jobIds: [job.id] };
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
