/**
 * The server of a React Router storefront (`storefront-runtime start`): the browser build, the
 * public settings, the static site and the server render, in that order.
 *
 * 1. `/assets/*` and the files of `public/` from `build/client` (assets immutable); an asset of
 *    an earlier build, which a static page may still name, from the static store.
 * 2. `/__env.js` from this process's environment.
 * 3. Past the static site: methods other than `GET` and `HEAD`, `/auth/*`, React Router's
 *    data requests (`*.data`), `/__builder/*`. The builder's render header is the builder's
 *    alone: a request from outside loses it.
 * 4. `/__static/data/*.json` from the store, or 404: never rendered.
 * 5. The HTML of an address from its key (`staticKeyForPath`). A query string of campaign
 *    and analytics parameters only is the address without it; any other parameter (`sort`,
 *    `filter.*`, `variant`) may change the page, so the server renders it (`miss`).
 * 6. A file: 200 (its own status for `404.html`), its ETag, revalidated on every load,
 *    `x-shopana-static: hit`; 304 for `If-None-Match`. No cookie is read: the HTML is a
 *    guest's, the browser personalizes it. The statuses and languages come from the small
 *    index of the site (`__static/server.json`), never its whole manifest.
 * 7. No file: the server render, as without a static site (`x-shopana-static: miss`). The
 *    builder's coordinator, when there is one, hears every 30 s how often each page was served
 *    and which pages of a generated family had no file while the server rendered them
 *    (`POST /__builder/api/hits`).
 * 8. A store that fails: the server render, and a warning. A bucket down is never a 5xx.
 *
 * `staticOnly` renders nothing: a missing page gets the shell of its family or `404.html`.
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import express, {
  type NextFunction,
  type Request as ExpressRequest,
  type Response as ExpressResponse,
} from 'express';
import { createRequestHandler } from '@react-router/express';
import type { ServerBuild } from 'react-router';
import type { StaticServerIndex } from '@shopana/storefront-sdk/static';
import {
  PUBLIC_ENV_PATH,
  publicEnvironmentSource,
} from '../react-router/public-env';
import {
  STATIC_RENDER_HEADER,
  STATIC_RENDER_KEY_HEADER,
} from '../react-router/static-render';
import {
  isStaticQuery,
  STATIC_ASSETS_PREFIX,
  STATIC_DATA_PREFIX,
  STATIC_NOT_FOUND_KEY,
  STATIC_SERVER_INDEX_KEY,
  staticKeyForPath,
  staticShellKeyForPath,
} from './keys';
import { createCachedStore } from './memory-cache';
import {
  contentHash,
  etagMatches,
  isDirectory,
  openStaticStore,
  quoteEtag,
  type StaticRead,
  type StaticStore,
} from './store';

/** The response header that tells a static file from a server render. */
export const STATIC_RESPONSE_HEADER = 'x-shopana-static';

/** How a static page is cached by browsers: kept, but asked again with its ETag every time. */
const STATIC_CACHE_CONTROL = 'public, max-age=0, must-revalidate';

/** Families whose pages the builder renders: a miss there is a page the builder should add. */
const GENERATED_FAMILIES = new Set([
  'products',
  'p',
  'categories',
  'collections',
  'c',
  'vendors',
  'pages',
]);

/** How often the coordinator hears of the pages served and missed. */
const HITS_REPORT_INTERVAL_MS = 30_000;
/** Distinct keys a report holds at most: addresses are the visitors' to choose. */
const MAX_REPORTED_KEYS = 10_000;
/** Pages of a report without a file at most. */
const MAX_REPORTED_MISSES = 1_000;
/** A handle longer than this is no page of a catalog. */
const MAX_HANDLE_LENGTH = 200;

/** The index of the site is trusted this long: a directory is otherwise read on every request. */
const INDEX_TTL_MS = 1_000;

export interface StorefrontServerOptions {
  /** The runtime directory: `build/server/index.js`, `build/client`. */
  runtimeDir: string;
  /** The server build; imported from `build/server/index.js` without it. */
  build?: ServerBuild;
  /** The server render in place of React Router's handler of the build (tests). */
  render?: express.RequestHandler;
  /** The static site; none: every page is rendered. */
  store?: StaticStore | null;
  /** No server render: a missing page is answered by its family's shell or `404.html`. */
  staticOnly?: boolean;
  /**
   * The process environment: `/__env.js`, the coordinator (`STOREFRONT_STATIC_COORDINATOR_URL`
   * and its token `STOREFRONT_STATIC_COORDINATOR_TOKEN`).
   */
  env?: Record<string, string | undefined>;
  /** Where warnings go. */
  logger?: Pick<Console, 'warn' | 'info'>;
  fetch?: typeof fetch;
  now?: () => number;
}

/**
 * The store of the server, from `STOREFRONT_STATIC_STORE` (`s3://<bucket>/<prefix>` or
 * `fs:<dir>` relative to the runtime directory); without it, `build/static` of the runtime
 * directory when a build left its index there; else none. A bucket is read through the
 * memory cache (`STOREFRONT_STATIC_CACHE_TTL` seconds, 10 by default).
 */
export async function resolveServerStore(
  runtimeDir: string,
  env: Record<string, string | undefined> = process.env,
  options: { fetch?: typeof fetch; now?: () => number } = {}
): Promise<StaticStore | null> {
  const address = env.STOREFRONT_STATIC_STORE?.trim();
  if (!address) {
    const dir = path.join(runtimeDir, 'build/static');
    if (!(await isDirectory(dir))) return null;
    const store = openStaticStore(`fs:${dir}`);
    const index = await store.read(STATIC_SERVER_INDEX_KEY);
    return index.status === 'found' ? store : null;
  }
  const store = openStaticStore(address, {
    cwd: runtimeDir,
    env,
    fetch: options.fetch,
  });
  // A directory is read on every request; it hashes a file once per version of it.
  if (store.kind === 'fs') return store;
  const ttl = Number(env.STOREFRONT_STATIC_CACHE_TTL?.trim() || 10);
  return createCachedStore(store, {
    ttlMs: (Number.isFinite(ttl) && ttl >= 0 ? ttl : 10) * 1000,
    maxBytes: 50 * 1024 * 1024,
    now: options.now,
  });
}

/** The index of a store's site, read at most once a second and parsed once per version of it. */
function indexReader(store: StaticStore, now: () => number) {
  let parsed: { etag: string; index: StaticServerIndex } | null = null;
  let checked: { at: number; index: StaticServerIndex | null } | null = null;
  return async (): Promise<StaticServerIndex | null> => {
    if (checked && now() - checked.at < INDEX_TTL_MS) return checked.index;
    const read = await store.read(STATIC_SERVER_INDEX_KEY);
    if (read.status !== 'found') {
      parsed = null;
    } else if (parsed?.etag !== read.etag) {
      parsed = {
        etag: read.etag,
        index: JSON.parse(read.body.toString('utf8')) as StaticServerIndex,
      };
    }
    checked = { at: now(), index: parsed?.index ?? null };
    return checked.index;
  };
}

/**
 * The pathname of a request as the browser sent it, without the query string, its dot
 * segments resolved. `//host/x` is a path here, never an origin.
 */
function pathnameOf(request: ExpressRequest): string {
  const target = request.originalUrl;
  return new URL(
    target.startsWith('/') ? `http://storefront.local${target}` : target,
    'http://storefront.local'
  ).pathname;
}

/** Requests the static site never answers. */
function bypassesStatic(request: ExpressRequest, pathname: string): boolean {
  return (
    (request.method !== 'GET' && request.method !== 'HEAD') ||
    pathname === '/auth' ||
    pathname.startsWith('/auth/') ||
    pathname.endsWith('.data') ||
    pathname.startsWith('/__builder/')
  );
}

export async function createStorefrontServer(
  options: StorefrontServerOptions
): Promise<express.Express> {
  const {
    runtimeDir,
    staticOnly = false,
    env = process.env,
    logger = console,
    now = Date.now,
  } = options;
  const store = options.store === undefined ? null : options.store;
  const fetchImpl = options.fetch ?? fetch;
  const clientDir = path.join(runtimeDir, 'build/client');
  const render =
    options.render ??
    createRequestHandler({
      build:
        options.build ??
        ((await import(
          pathToFileURL(path.join(runtimeDir, 'build/server/index.js')).href
        )) as ServerBuild),
      mode: env.NODE_ENV ?? 'production',
    });
  const readIndex = store ? indexReader(store, now) : null;
  const report = store ? hitsReporter({ env, fetch: fetchImpl, logger }) : null;

  const app = express();
  app.disable('x-powered-by');
  app.disable('etag');

  // A short log line per request, as the server it replaces wrote.
  app.use((request, response, next) => {
    // Only the builder renders a static page; from outside it is an ordinary request.
    delete request.headers[STATIC_RENDER_HEADER];
    delete request.headers[STATIC_RENDER_KEY_HEADER];
    const started = now();
    response.once('finish', () => {
      logger.info(
        `${request.method} ${request.originalUrl} ${response.statusCode} - ${now() - started} ms`
      );
    });
    next();
  });

  /** A store answer with its headers; a HEAD request gets no body. */
  const sendObject = (
    request: ExpressRequest,
    response: ExpressResponse,
    read: Extract<StaticRead, { status: 'found' }>,
    status: number,
    cacheControl: string,
    source: 'hit' | 'miss' = 'hit'
  ) => {
    response.status(status);
    response.setHeader('Content-Type', read.contentType);
    response.setHeader('Cache-Control', cacheControl);
    if (read.etag) response.setHeader('ETag', read.etag);
    response.setHeader(STATIC_RESPONSE_HEADER, source);
    if (request.method === 'HEAD') {
      response.setHeader('Content-Length', String(read.body.length));
      response.end();
    } else {
      response.end(read.body);
    }
  };

  // 1. The browser build: hashed assets for a year, the rest of `public/` for an hour.
  app.use(
    '/assets',
    express.static(path.join(clientDir, 'assets'), {
      immutable: true,
      maxAge: '1y',
      index: false,
    })
  );
  app.use(express.static(clientDir, { maxAge: '1h', index: false }));
  // An asset of an earlier build: a static page rendered with it may still name it.
  app.use('/assets', async (request, response) => {
    if (!store || (request.method !== 'GET' && request.method !== 'HEAD')) {
      response.status(404).end();
      return;
    }
    const key = `${STATIC_ASSETS_PREFIX}${pathnameOf(request).slice('/assets/'.length)}`;
    try {
      const read = await store.read(key);
      if (read.status === 'found') {
        sendObject(
          request,
          response,
          read,
          200,
          'public, max-age=31536000, immutable'
        );
        return;
      }
    } catch (error) {
      logger.warn(
        `[storefront] static store failed for ${key}: ${String(error)}`
      );
    }
    response.status(404).end();
  });

  // 2. The public settings of this process: the same for its life, so revalidated with their
  // ETag, which a document loading them before its modules answers with a 304.
  const envSource = publicEnvironmentSource(env);
  const envEtag = quoteEtag(contentHash(envSource));
  app.get(PUBLIC_ENV_PATH, (request, response) => {
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('ETag', envEtag);
    if (etagMatches(request.get('if-none-match'), envEtag)) {
      response.status(304).end();
      return;
    }
    response.setHeader('Content-Type', 'text/javascript; charset=utf-8');
    response.end(envSource);
  });

  /** What a missing page gets without a server render: its family's shell or the 404 page. */
  const sendFallback = async (
    request: ExpressRequest,
    response: ExpressResponse,
    pathname: string,
    index: StaticServerIndex | null
  ) => {
    const shellKey = staticShellKeyForPath(pathname, index?.locales ?? []);
    for (const [key, status] of [
      [shellKey, 200],
      [STATIC_NOT_FOUND_KEY, 404],
    ] as const) {
      if (!key || !store) continue;
      try {
        const read = await store.read(key);
        if (read.status === 'found') {
          sendObject(request, response, read, status, 'no-cache', 'miss');
          return;
        }
      } catch (error) {
        logger.warn(
          `[storefront] static store failed for ${key}: ${String(error)}`
        );
      }
    }
    response.status(404).type('text/plain').end('Not Found');
  };

  // 3–8. The static site.
  app.use(async (request, response, next: NextFunction) => {
    const pathname = pathnameOf(request);
    if (bypassesStatic(request, pathname)) {
      next();
      return;
    }

    // 4. The data of a page: from the store or nothing.
    if (pathname.startsWith(`/${STATIC_DATA_PREFIX}`)) {
      const key = pathname.slice(1);
      try {
        const read =
          store && key.endsWith('.json')
            ? await store.read(key, {
                ifNoneMatch: request.get('if-none-match') ?? undefined,
              })
            : ({ status: 'missing' } as const);
        if (read.status === 'found') {
          sendObject(request, response, read, 200, STATIC_CACHE_CONTROL);
          return;
        }
        if (read.status === 'not-modified') {
          response.status(304);
          response.setHeader('ETag', read.etag);
          response.setHeader('Cache-Control', STATIC_CACHE_CONTROL);
          response.end();
          return;
        }
      } catch (error) {
        logger.warn(
          `[storefront] static store failed for ${key}: ${String(error)}`
        );
      }
      response.status(404).setHeader('Cache-Control', 'no-store').end();
      return;
    }

    const key = store ? staticKeyForPath(pathname) : null;
    if (!store || !key) {
      if (staticOnly && store) {
        await sendFallback(
          request,
          response,
          pathname,
          await readIndex!().catch(() => null)
        );
        return;
      }
      next();
      return;
    }

    // 5. A parameter the page may render (sort, filters, a variant): the server renders it.
    if (!staticOnly && !isStaticQuery(searchOf(request))) {
      response.setHeader(STATIC_RESPONSE_HEADER, 'miss');
      next();
      return;
    }

    let index: StaticServerIndex | null = null;
    try {
      index = await readIndex!();
      // 5–6. The file of the address.
      const read = await store.read(key, {
        ifNoneMatch: request.get('if-none-match') ?? undefined,
      });
      if (read.status === 'found') {
        const status = index?.statuses[key] ?? 200;
        report?.hit(key);
        sendObject(request, response, read, status, STATIC_CACHE_CONTROL);
        return;
      }
      if (read.status === 'not-modified') {
        report?.hit(key);
        response.status(304);
        response.setHeader('ETag', read.etag);
        response.setHeader('Cache-Control', STATIC_CACHE_CONTROL);
        response.setHeader(STATIC_RESPONSE_HEADER, 'hit');
        response.end();
        return;
      }
    } catch (error) {
      // 8. A store that fails is a miss.
      logger.warn(
        `[storefront] static store failed for ${key}: ${String(error)}`
      );
    }

    // 7. No file: the server render.
    response.setHeader(STATIC_RESPONSE_HEADER, 'miss');
    if (staticOnly) {
      await sendFallback(request, response, pathname, index);
      return;
    }
    if (report && isGeneratedPage(pathname, index?.locales ?? [])) {
      // A page the builder should add is one the server rendered: an address made up by a
      // visitor is its 404, never reported.
      response.once('finish', () => {
        if (response.statusCode === 200) report.miss(key);
      });
    }
    next();
  });

  if (!staticOnly) app.use(render);
  return app;
}

/** The query string of a request. */
function searchOf(request: ExpressRequest): URLSearchParams {
  const query = request.originalUrl.indexOf('?');
  return new URLSearchParams(
    query === -1 ? '' : request.originalUrl.slice(query + 1)
  );
}

/**
 * Whether an address is a page of a family the builder renders: its family and one handle
 * (`/uk/products/x`), of a length a catalog has.
 */
function isGeneratedPage(
  pathname: string,
  localeSegments: readonly string[]
): boolean {
  const segments = pathname.split('/').filter(Boolean);
  const unlocalized = localeSegments.includes(segments[0]?.toLowerCase() ?? '')
    ? segments.slice(1)
    : segments;
  return (
    unlocalized.length === 2 &&
    GENERATED_FAMILIES.has(unlocalized[0]) &&
    unlocalized[1].length <= MAX_HANDLE_LENGTH
  );
}

/**
 * The report to the builder's coordinator, when the environment names one
 * (`STOREFRONT_STATIC_COORDINATOR_URL`): how often each static page was served and which pages
 * of a generated family had no file, sent every 30 s while there is something to tell
 * (`POST /__builder/api/hits`, the coordinator's `STOREFRONT_STATIC_COORDINATOR_TOKEN`). A
 * report that fails is dropped.
 */
function hitsReporter({
  env,
  fetch: fetchImpl,
  logger,
}: {
  env: Record<string, string | undefined>;
  fetch: typeof fetch;
  logger: Pick<Console, 'warn'>;
}) {
  const coordinator = env.STOREFRONT_STATIC_COORDINATOR_URL?.trim();
  if (!coordinator) return null;
  const token = env.STOREFRONT_STATIC_COORDINATOR_TOKEN?.trim();
  let hits = new Map<string, number>();
  let misses = new Set<string>();
  let timer: ReturnType<typeof setInterval> | null = null;

  const flush = () => {
    if (hits.size === 0 && misses.size === 0) {
      // Nothing came in: no timer until something does.
      if (timer) clearInterval(timer);
      timer = null;
      return;
    }
    const body = JSON.stringify({
      hits: Object.fromEntries(hits),
      ...(misses.size > 0 ? { misses: [...misses] } : {}),
    });
    hits = new Map();
    misses = new Set();
    void fetchImpl(new URL('/__builder/api/hits', coordinator), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
      signal: AbortSignal.timeout(HITS_REPORT_INTERVAL_MS),
    })
      .then((reply) => reply.body?.cancel())
      .catch((error: unknown) => {
        logger.warn(
          `[storefront] static coordinator unreachable: ${String(error)}`
        );
      });
  };
  const scheduled = () => {
    if (timer) return;
    timer = setInterval(flush, HITS_REPORT_INTERVAL_MS);
    timer.unref();
  };

  return {
    hit(key: string) {
      if (!hits.has(key) && hits.size >= MAX_REPORTED_KEYS) return;
      hits.set(key, (hits.get(key) ?? 0) + 1);
      scheduled();
    },
    miss(key: string) {
      if (misses.size >= MAX_REPORTED_MISSES) return;
      misses.add(key);
      scheduled();
    },
    flush,
  };
}

export interface StartStorefrontServerOptions {
  runtimeDir: string;
  port?: number;
  host?: string;
  staticOnly?: boolean;
  env?: Record<string, string | undefined>;
}

/** Starts the server on `PORT` (3000) of `HOST`, until the process ends. */
export async function startStorefrontServer({
  runtimeDir,
  port,
  host,
  staticOnly = false,
  env = process.env,
}: StartStorefrontServerOptions) {
  const store = await resolveServerStore(runtimeDir, env);
  if (staticOnly && !store) {
    throw new Error(
      '--static-only serves a static site: none in STOREFRONT_STATIC_STORE or build/static'
    );
  }
  const app = await createStorefrontServer({
    runtimeDir,
    store,
    staticOnly,
    env,
  });
  const listenPort = port ?? Number(env.PORT || 3000);
  const listenHost = host ?? env.HOST;
  const server = await new Promise<import('node:http').Server>((resolve) => {
    const listening = listenHost
      ? app.listen(listenPort, listenHost, () => resolve(listening))
      : app.listen(listenPort, () => resolve(listening));
  });
  console.info(
    `[storefront] http://${listenHost ?? 'localhost'}:${listenPort}` +
      (store ? ` with the static site of ${store.url}` : '') +
      (staticOnly ? ' (static only)' : '')
  );
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => server.close(() => process.exit(0)));
  }
  return server;
}
