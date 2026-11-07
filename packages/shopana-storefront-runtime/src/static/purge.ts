/**
 * Purges tags of the CDN's cache (Cloudflare, `POST /zones/:zone/purge_cache {tags}`): the job
 * of `static run` purges the pages it published (`pg:<pageKey>`), the coordinator the light
 * answers of what events changed (`sf-p-<uuid>`, `sf-promo`, `sf-vol`). At most 100 tags a
 * request. Without a token there is nothing to purge: the CDN does not cache HTML (step A).
 */

/** Tags in one purge request. */
export const PURGE_BATCH = 100;

export interface StaticPurger {
  /** Purges the tags, `PURGE_BATCH` a request; throws `PurgeRateLimited` on 429. */
  purge(tags: readonly string[]): Promise<void>;
}

export class PurgeRateLimited extends Error {
  constructor(readonly retryAfterMs: number) {
    super(`The CDN limits purges: again in ${retryAfterMs} ms`);
    this.name = 'PurgeRateLimited';
  }
}

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

/** The purger of a Cloudflare zone. */
export function createCloudflarePurger({
  zoneId,
  token,
  fetch: fetchImpl = fetch,
  apiUrl = 'https://api.cloudflare.com/client/v4',
}: {
  zoneId: string;
  token: string;
  fetch?: FetchLike;
  apiUrl?: string;
}): StaticPurger {
  return {
    async purge(tags) {
      const unique = [...new Set(tags)];
      for (let index = 0; index < unique.length; index += PURGE_BATCH) {
        const batch = unique.slice(index, index + PURGE_BATCH);
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
          const seconds = Number(response.headers.get('retry-after'));
          await response.body?.cancel();
          throw new PurgeRateLimited(
            Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 60_000
          );
        }
        const payload = (await response.json().catch(() => null)) as {
          success?: boolean;
          errors?: Array<{ message: string }>;
        } | null;
        if (!response.ok || payload?.success === false) {
          throw new Error(
            `Purging ${batch.length} tags failed: ${response.status} ${payload?.errors?.map((error) => error.message).join('; ') ?? ''}`.trim()
          );
        }
      }
    },
  };
}

/** The purger of the environment (`CLOUDFLARE_PURGE_TOKEN`, `CLOUDFLARE_ZONE_ID`), or null. */
export function purgerFromEnv(
  env: Record<string, string | undefined>,
  fetchImpl?: FetchLike
): StaticPurger | null {
  const token = env.CLOUDFLARE_PURGE_TOKEN?.trim();
  const zoneId = env.CLOUDFLARE_ZONE_ID?.trim();
  if (!token || !zoneId) return null;
  return createCloudflarePurger({ zoneId, token, fetch: fetchImpl });
}
