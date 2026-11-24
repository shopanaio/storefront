/**
 * Purges tags of the CDN's cache (Cloudflare, `POST /zones/:zone/purge_cache {tags}`): a render
 * of the coordinator purges the pages it published (`pg:<pageKey>`) and a full build its builds
 * (`build:<buildId>`). At most 100 tags a request. Without a token there is nothing to purge:
 * the CDN does not cache HTML (step A).
 *
 * The purge limit is the account's and is shared with the purger of the storefront API cache
 * (internal `runtime-scheduler`): each of them keeps its own token bucket on half of the limit of
 * the zone's plan, so neither starves the other.
 */

/** Tags in one purge request. */
export const PURGE_BATCH = 100;

export interface StaticPurger {
  /**
   * Purges the tags, `PURGE_BATCH` a request. Waits for a token of its share of the limit (up to
   * `PURGE_MAX_WAIT_MS`); throws `PurgeRateLimited` past it and on 429 / error `1134`.
   */
  purge(tags: readonly string[]): Promise<void>;
}

export class PurgeRateLimited extends Error {
  constructor(readonly retryAfterMs: number) {
    super(`The CDN limits purges: again in ${retryAfterMs} ms`);
    this.name = 'PurgeRateLimited';
  }
}

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

export type PurgePlan = 'free' | 'pro' | 'business' | 'enterprise';

/** Purge-by-tag requests of the account per window. */
const PLAN_LIMITS: Record<PurgePlan, { requests: number; windowMs: number }> = {
  free: { requests: 5, windowMs: 60_000 },
  pro: { requests: 5, windowMs: 1000 },
  business: { requests: 10, windowMs: 1000 },
  enterprise: { requests: 50, windowMs: 1000 },
};

/** The share of the account's purge limit of this purger. */
export const PURGE_BUDGET_SHARE = 0.5;

/** The longest wait for a token of the bucket before the purge gives up. */
export const PURGE_MAX_WAIT_MS = 60_000;

/** Cloudflare's error code of a purge over the account's rate limit. */
const RATE_LIMITED_CODE = 1134;

/** A token bucket on a share of the plan's limit. */
export function purgeBudget(
  plan: PurgePlan,
  share = PURGE_BUDGET_SHARE,
  now: () => number = () => Date.now()
) {
  const limit = PLAN_LIMITS[plan];
  const capacity = Math.max(1, Math.floor(limit.requests * share));
  const perMs = (limit.requests * share) / limit.windowMs;
  let tokens = capacity;
  let updatedAt = now();
  const refill = () => {
    const at = now();
    tokens = Math.min(capacity, tokens + (at - updatedAt) * perMs);
    updatedAt = at;
  };
  return {
    /** Takes a token, or returns how long to wait for one. */
    take(): number {
      refill();
      if (tokens >= 1) {
        tokens -= 1;
        return 0;
      }
      return Math.ceil((1 - tokens) / perMs);
    },
    /** A 429 of the API: the bucket is empty until it refills. */
    drain() {
      refill();
      tokens = 0;
    },
  };
}

/** The purger of a Cloudflare zone. */
export function createCloudflarePurger({
  zoneId,
  token,
  fetch: fetchImpl = fetch,
  apiUrl = 'https://api.cloudflare.com/client/v4',
  plan = 'free',
  now,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
}: {
  zoneId: string;
  token: string;
  fetch?: FetchLike;
  apiUrl?: string;
  /** The zone's plan: the purge limit of the account. */
  plan?: PurgePlan;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}): StaticPurger {
  const budget = purgeBudget(plan, PURGE_BUDGET_SHARE, now);
  return {
    async purge(tags) {
      const unique = [...new Set(tags)];
      for (let index = 0; index < unique.length; index += PURGE_BATCH) {
        const batch = unique.slice(index, index + PURGE_BATCH);
        for (let wait = budget.take(); wait > 0; wait = budget.take()) {
          if (wait > PURGE_MAX_WAIT_MS) {
            throw new PurgeRateLimited(wait);
          }
          await sleep(wait);
        }
        const response = await fetchImpl(
          `${apiUrl}/zones/${encodeURIComponent(zoneId)}/purge_cache`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tags: batch }),
          }
        );
        if (response.status === 429) {
          budget.drain();
          const seconds = Number(response.headers.get('retry-after'));
          await response.body?.cancel();
          throw new PurgeRateLimited(
            Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 60_000
          );
        }
        const payload = (await response.json().catch(() => null)) as {
          success?: boolean;
          errors?: Array<{ code?: number; message: string }>;
        } | null;
        if (payload?.errors?.some((error) => error.code === RATE_LIMITED_CODE)) {
          budget.drain();
          throw new PurgeRateLimited(60_000);
        }
        if (!response.ok || payload?.success === false) {
          throw new Error(
            `Purging ${batch.length} tags failed: ${response.status} ${payload?.errors?.map((error) => error.message).join('; ') ?? ''}`.trim()
          );
        }
      }
    },
  };
}

/**
 * The purger of the environment (`CLOUDFLARE_PURGE_TOKEN`, `CLOUDFLARE_ZONE_ID`,
 * `CLOUDFLARE_PURGE_PLAN` — `free` by default), or null.
 */
export function purgerFromEnv(
  env: Record<string, string | undefined>,
  fetchImpl?: FetchLike
): StaticPurger | null {
  const token = env.CLOUDFLARE_PURGE_TOKEN?.trim();
  const zoneId = env.CLOUDFLARE_ZONE_ID?.trim();
  if (!token || !zoneId) return null;
  const plan = env.CLOUDFLARE_PURGE_PLAN?.trim() || 'free';
  if (!(plan in PLAN_LIMITS)) {
    throw new Error(`CLOUDFLARE_PURGE_PLAN: unsupported value "${plan}"`);
  }
  return createCloudflarePurger({ zoneId, token, fetch: fetchImpl, plan: plan as PurgePlan });
}
