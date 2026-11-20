/**
 * The CDN worker of the static site (step B of plans/static-coordinator.ru.md): HTML pages and
 * their data answered from the R2 bucket through the cache of the CDN, everything else and
 * every address without a file from the hybrid node through the Tunnel.
 *
 * 1. The key of an address is the node's (`staticKeyForPath`); an address with a parameter
 *    that changes the page (`isStaticQuery`) goes to the node.
 * 2. The Cache API first (a worker's response is not cached by the CDN by itself); a miss reads
 *    the object, puts it with `s-maxage=600, stale-while-revalidate=3600`, its ETag and its
 *    `Cache-Tag` (`pg:<pageKey>, build:<buildId>` of its metadata, purged by the jobs), and
 *    tells the coordinator of the hit (a stale page is rendered again on its first visit).
 * 3. No object: the node, cookies and answer as they are. The node unreachable: the shell of
 *    the page's family (200) or `404.html` (404).
 * 4. `/auth/*`, `/__env.js`, `/__builder/*` and every method but GET and HEAD: the node, never
 *    cached.
 *
 * `keys.ts` of the runtime has no Node built-ins: the worker imports the node's own functions.
 */
import {
  isStaticQuery,
  STATIC_DATA_PREFIX,
  STATIC_NOT_FOUND_KEY,
  STATIC_SERVER_INDEX_KEY,
  staticKeyForPath,
  staticShellKeyForPath,
} from '../../../packages/shopana-storefront-runtime/src/static/keys';

/** The part of an R2 object the worker reads. */
export interface SiteObject {
  body: ReadableStream | null;
  httpEtag: string;
  httpMetadata?: { contentType?: string };
  customMetadata?: Record<string, string>;
  text(): Promise<string>;
}

export interface SiteBucket {
  get(key: string): Promise<SiteObject | null>;
}

export interface WorkerEnv {
  /** The R2 bucket of the environment's static site. */
  SITE: SiteBucket;
  /** The prefix of the site in the bucket (`site`, as in `s3://<bucket>/site`). */
  SITE_PREFIX?: string;
  /** The coordinator's public URL (`https://<hostname>`) for the reports of hits. */
  COORDINATOR_URL?: string;
  /** The internal token of the reports (`STOREFRONT_STATIC_COORDINATOR_TOKEN`, a secret). */
  COORDINATOR_TOKEN?: string;
  /** The origin of the node when it is not the zone's own (tests, a staging origin). */
  ORIGIN?: string;
}

export interface WorkerContext {
  waitUntil(promise: Promise<unknown>): void;
}

export interface EdgeCache {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
}

/** How long the CDN keeps a page, and serves it stale while it reads it again. */
export const PAGE_CACHE_CONTROL =
  'public, max-age=0, s-maxage=600, stale-while-revalidate=3600';

/** Files of `public/` (`/favicon.ico`): two hours at the edge, as the zone's rule had it. */
export const PUBLIC_CACHE_CONTROL = 'public, max-age=3600, s-maxage=7200';

/** Where the files of the theme's `public/` are in the bucket. */
const PUBLIC_PREFIX = 'public/';

/** Paths the node answers itself, never the bucket. */
const NODE_PREFIXES = [
  '/auth/',
  '/__builder/',
  '/graphql',
  '/apps/',
  '/.well-known/',
];

/** The node did not answer: no response, or one of the Tunnel's errors. */
const UNREACHABLE = new Set([502, 503, 504, 520, 521, 522, 523, 524, 530]);

/** Language segments of the site, read from its index once a minute per isolate. */
let locales: { at: number; value: string[] } | null = null;

export function resetWorkerState(): void {
  locales = null;
}

function objectKey(env: WorkerEnv, key: string): string {
  const prefix = env.SITE_PREFIX?.replace(/^\/+|\/+$/g, '');
  return prefix ? `${prefix}/${key}` : key;
}

async function siteLocales(env: WorkerEnv, now: number): Promise<string[]> {
  if (locales && now - locales.at < 60_000) return locales.value;
  const index = await env.SITE.get(objectKey(env, STATIC_SERVER_INDEX_KEY));
  let value: string[] = [];
  if (index) {
    try {
      value =
        (JSON.parse(await index.text()) as { locales?: string[] }).locales ??
        [];
    } catch {
      value = [];
    }
  }
  locales = { at: now, value };
  return value;
}

/** The answer of an object of the bucket, as cached: with its tags of the CDN. */
function objectResponse(
  object: SiteObject,
  status: number,
  cacheControl: string
): Response {
  const headers = new Headers({
    'Content-Type':
      object.httpMetadata?.contentType ?? 'text/html; charset=utf-8',
    'Cache-Control': cacheControl,
    ETag: object.httpEtag,
    'x-shopana-static': 'hit',
  });
  const tags = object.customMetadata?.['cache-tag'];
  if (tags) headers.set('Cache-Tag', tags);
  return new Response(object.body, { status, headers });
}

/** What the browser gets of a cached answer: no tags, `304` for its ETag, no body to HEAD. */
function toClient(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  headers.delete('Cache-Tag');
  const etag = headers.get('ETag');
  const ifNoneMatch = request.headers.get('If-None-Match');
  if (
    etag &&
    ifNoneMatch &&
    ifNoneMatch
      .split(',')
      .some(
        (tag) => tag.trim().replace(/^W\//, '') === etag.replace(/^W\//, '')
      )
  ) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(request.method === 'HEAD' ? null : response.body, {
    status: response.status,
    headers,
  });
}

/** The node, with the request as it came (cookies, method, body). */
function toNode(
  request: Request,
  env: WorkerEnv,
  fetcher: typeof fetch
): Promise<Response> {
  if (!env.ORIGIN) return fetcher(request);
  const url = new URL(request.url);
  const origin = new URL(env.ORIGIN);
  url.protocol = origin.protocol;
  url.host = origin.host;
  return fetcher(new Request(url, request));
}

/** Tells the coordinator of a page the CDN did not have (a stale one is rendered again). */
function report(
  env: WorkerEnv,
  key: string,
  ctx: WorkerContext,
  fetcher: typeof fetch
): void {
  if (!env.COORDINATOR_URL || !env.COORDINATOR_TOKEN) return;
  ctx.waitUntil(
    fetcher(new URL('/__builder/api/hits', env.COORDINATOR_URL), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.COORDINATOR_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hits: { [key]: 1 } }),
    }).catch(() => undefined)
  );
}

export interface WorkerDependencies {
  cache: EdgeCache;
  fetch?: typeof fetch;
  now?: () => number;
}

/** The fetch handler of the worker. */
export async function handleRequest(
  request: Request,
  env: WorkerEnv,
  ctx: WorkerContext,
  { cache, fetch: fetcher = fetch, now = Date.now }: WorkerDependencies
): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;
  if (
    (request.method !== 'GET' && request.method !== 'HEAD') ||
    pathname === '/__env.js' ||
    NODE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return toNode(request, env, fetcher);
  }

  let key: string | null;
  let cacheControl = PAGE_CACHE_CONTROL;
  let page = false;
  if (pathname.startsWith(`/${STATIC_DATA_PREFIX}`)) {
    key =
      pathname.endsWith('.json') && !pathname.includes('..')
        ? pathname.slice(1)
        : null;
    if (!key) return new Response('Not found', { status: 404 });
  } else {
    key = staticKeyForPath(pathname);
    page = key !== null;
    if (!key) {
      // A file of `public/` (`/favicon.ico`), else the node (old assets, React Router data).
      key = /^\/[^/]+\.[a-z0-9]+$/i.test(pathname)
        ? `${PUBLIC_PREFIX}${pathname.slice(1)}`
        : null;
      cacheControl = PUBLIC_CACHE_CONTROL;
      if (!key) return toNode(request, env, fetcher);
    } else if (!isStaticQuery(url.searchParams)) {
      return toNode(request, env, fetcher);
    }
  }

  // One entry per address: tracking parameters are no part of the page.
  const cacheKey = new Request(`${url.origin}${pathname}`, { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) return toClient(request, cached);

  const object = await env.SITE.get(objectKey(env, key));
  if (object) {
    const response = objectResponse(object, 200, cacheControl);
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    if (page) report(env, key, ctx, fetcher);
    return toClient(request, response);
  }
  if (!page && cacheControl === PUBLIC_CACHE_CONTROL)
    return toNode(request, env, fetcher);
  if (!page) return new Response('Not found', { status: 404 });

  // No file: the node renders it (its own report of the miss), or the site degrades.
  let response: Response | null = null;
  try {
    response = await toNode(request, env, fetcher);
  } catch {
    response = null;
  }
  if (response && !UNREACHABLE.has(response.status)) return response;
  const shellKey = staticShellKeyForPath(
    pathname,
    await siteLocales(env, now())
  );
  const shell = shellKey ? await env.SITE.get(objectKey(env, shellKey)) : null;
  if (shell)
    return toClient(request, objectResponse(shell, 200, 'private, no-store'));
  const notFound = await env.SITE.get(objectKey(env, STATIC_NOT_FOUND_KEY));
  if (notFound)
    return toClient(
      request,
      objectResponse(notFound, 404, 'private, no-store')
    );
  return response ?? new Response('Service unavailable', { status: 503 });
}

const worker = {
  fetch(
    request: Request,
    env: WorkerEnv,
    ctx: WorkerContext
  ): Promise<Response> {
    return handleRequest(request, env, ctx, {
      cache: (globalThis as unknown as { caches: { default: EdgeCache } })
        .caches.default,
    });
  },
};

export default worker;
