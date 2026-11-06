/**
 * The static site builder: every address of a theme's static config rendered by its server
 * build, as a guest, into a store (a directory or a bucket), with the data of each page, the
 * shells, the 404 page, `robots.txt` and the sitemaps, the assets of the build, and the
 * manifest last. A full build replaces the site; `renderStaticPaths` adds or renews pages.
 */
import { readdir, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { ServerBuild } from 'react-router';
import type {
  StorefrontLocale,
  StorefrontLocales,
} from '@shopana/storefront-sdk/routing';
import {
  STATIC_MANIFEST_VERSION,
  type StaticManifest,
  type StaticManifestFile,
} from '@shopana/storefront-sdk/static';
import type { StaticSiteEntry } from '../react-router/static-site';
import type { StaticRenderMode } from '../react-router/static-render';
import {
  STATIC_ASSETS_PREFIX,
  STATIC_MANIFEST_KEY,
  STATIC_NOT_FOUND_KEY,
  STATIC_SHELL_FAMILIES,
  staticDataKeyForPath,
  staticKeyForPath,
  staticShellKey,
} from './keys';
import { createRenderPool } from './pool';
import { withStaticDocumentInfo } from './postprocess';
import {
  createStaticRenderer,
  type StaticRenderRequest,
  type StaticRenderResult,
} from './renderer';
import { contentHash, contentTypeOf, type StaticStore } from './store';

/** Objects of an earlier build no manifest lists any more are deleted after this. */
const RETIRED_KEEP_MS = 7 * 24 * 60 * 60 * 1000;

/** The path the 404 page is rendered at: no page of any store has it. */
const NOT_FOUND_PATH = '/__static/not-found';

/** The address each family shell renders at: its family's route with a handle no page has. */
const FAMILY_SHELL_PATHS: Record<string, string> = {
  products: '/products/__shell',
  categories: '/categories/__shell',
  collections: '/collections/__shell',
  vendors: '/vendors/__shell',
  pages: '/pages/__shell',
};

export interface StaticBuildOptions {
  /** The theme's runtime directory: `build/server/index.js`, `build/client/assets`. */
  runtimeDir: string;
  store: StaticStore;
  /** The public origin of the store. */
  origin: string;
  /** Pages rendered at once; the config's, else the CPUs. */
  concurrency?: number;
  logger?: Pick<Console, 'info' | 'warn' | 'error'>;
  /** Renders in this thread instead of workers (tests). */
  inProcess?: boolean;
  /** The server build, for `inProcess`. */
  build?: ServerBuild;
  now?: () => Date;
}

export interface StaticBuildReport {
  pages: number;
  shells: number;
  skipped: number;
  removed: number;
  failed: Array<{ path: string; reason: string }>;
  durationMs: number;
  manifest: StaticManifest;
}

/** A page to render and where its files go. */
interface RenderTask {
  request: StaticRenderRequest;
  kind: StaticManifestFile['kind'];
  /** The URL segment of its language. */
  locale: string;
  key: string;
  expectedStatus: number;
}

async function loadBuild(runtimeDir: string): Promise<ServerBuild> {
  return (await import(
    pathToFileURL(path.join(runtimeDir, 'build/server/index.js')).href
  )) as ServerBuild;
}

/** The static site of a server build (`entry.server`'s `staticSite`). */
function staticSiteOf(build: ServerBuild): StaticSiteEntry {
  const entry = (build.entry.module as { staticSite?: StaticSiteEntry | null })
    .staticSite;
  if (!entry) {
    throw new Error(
      'The theme has no static site: add static.config.ts (defineStaticSite) and build again'
    );
  }
  return entry;
}

/**
 * The address of a page in a language, as served: its locale segment by the prefix mode, and
 * percent-encoded as a browser sends it (`/products/шапка` → `/products/%D1%88...`), so its key
 * is the one the server looks the request up by.
 */
export function localizedPath(
  pathname: string,
  locale: StorefrontLocale,
  locales: StorefrontLocales,
  prefix: 'always' | 'as-needed'
): string {
  const localized =
    prefix === 'as-needed' && locale.segment === locales.defaultLocale.segment
      ? pathname
      : `/${locale.segment}${pathname === '/' ? '' : pathname}`;
  return servedPath(localized);
}

/** An address as a browser sends it: percent-encoded, dot segments resolved, no query. */
function servedPath(pathname: string): string {
  return new URL(pathname, 'http://storefront.local').pathname;
}

/** Reads the manifest of a store; null without one. */
export async function readManifest(
  store: StaticStore
): Promise<StaticManifest | null> {
  const read = await store.read(STATIC_MANIFEST_KEY);
  if (read.status !== 'found') return null;
  const manifest = JSON.parse(read.body.toString('utf8')) as StaticManifest;
  return manifest.version === STATIC_MANIFEST_VERSION ? manifest : null;
}

/** Runs `work` over `items`, `limit` at a time. */
async function forEachLimited<T>(
  items: readonly T[],
  limit: number,
  work: (item: T) => Promise<void>
): Promise<void> {
  let next = 0;
  await Promise.all(
    Array.from(
      { length: Math.max(1, Math.min(limit, items.length)) },
      async () => {
        while (next < items.length) await work(items[next++]);
      }
    )
  );
}

/** The renderer of a build: workers, or this thread. */
function openRenderer(
  options: StaticBuildOptions,
  build: ServerBuild,
  concurrency: number,
  pagesPerWorker: number
) {
  if (options.inProcess) {
    const renderer = createStaticRenderer(build, {
      origin: options.origin,
      now: options.now,
    });
    return { render: renderer.render, close: async () => {} };
  }
  return createRenderPool({
    size: concurrency,
    pagesPerWorker,
    workerData: {
      serverBuildPath: path.join(options.runtimeDir, 'build/server/index.js'),
      origin: options.origin,
    },
  });
}

/** Writes rendered pages to the store, skipping those whose content is what it has. */
class SiteWriter {
  readonly files: Record<string, StaticManifestFile> = {};
  skipped = 0;
  written = 0;

  constructor(
    private readonly store: StaticStore,
    private readonly previous: StaticManifest | null,
    private readonly buildId: string
  ) {}

  /** Whether the store has `key` with `hash` from the previous build. */
  private unchanged(key: string, hash: string): StaticManifestFile | null {
    const file = this.previous?.files[key];
    return file && file.hash === hash ? file : null;
  }

  async writeFile(
    key: string,
    body: string | Buffer,
    entry: Omit<StaticManifestFile, 'hash' | 'contentType'>
  ): Promise<void> {
    const hash = contentHash(body);
    const contentType = contentTypeOf(key);
    const same = this.unchanged(key, hash);
    if (same) {
      this.files[key] = {
        ...entry,
        hash,
        contentType,
        renderedAt: same.renderedAt,
      };
      this.skipped += 1;
      return;
    }
    await this.store.write(key, body, contentType);
    this.files[key] = { ...entry, hash, contentType };
    this.written += 1;
  }

  /**
   * A rendered document and its data. Its hash leaves the static facts out: a page whose
   * content did not change keeps its file (and the moment it was rendered).
   */
  async writePage(task: RenderTask, result: StaticRenderResult): Promise<void> {
    const hash = contentHash(result.html);
    const same = this.unchanged(task.key, hash);
    const renderedAt = same?.renderedAt ?? result.renderedAt;
    const dataKey =
      task.kind === 'page' ? staticDataKeyForPath(task.request.path) : null;
    const entry: StaticManifestFile = {
      kind: task.kind,
      path: task.request.path,
      locale: task.locale,
      status: task.expectedStatus,
      contentType: contentTypeOf(task.key),
      hash,
      renderedAt,
      ...(dataKey ? { data: dataKey } : {}),
      ...(task.kind === 'page'
        ? { entities: result.entities, validUntil: result.validUntil }
        : {}),
    };
    if (same) {
      this.skipped += 1;
    } else {
      const html = withStaticDocumentInfo(result.html, {
        buildId: this.buildId,
        renderedAt,
        locale: task.locale,
        path: task.request.path,
        validUntil: task.kind === 'page' ? result.validUntil : null,
      });
      await this.store.write(task.key, html, entry.contentType);
      this.written += 1;
    }
    this.files[task.key] = entry;
    if (dataKey && result.state) {
      await this.writeFile(dataKey, result.state, {
        kind: 'data',
        status: 200,
        renderedAt,
      });
    }
  }
}

/**
 * Retires what a build no longer has: files of the previous manifest that `files` lacks, and
 * assets of earlier builds this one does not ship. A retired object stays for a week (an HTML
 * in a browser's cache still names it), then goes; one that comes back is no longer retired.
 */
async function retireStale(
  store: StaticStore,
  previous: StaticManifest | null,
  files: Record<string, StaticManifestFile>,
  assets: { stored: readonly string[]; current: ReadonlySet<string> },
  now: Date
): Promise<{ retired: Record<string, string>; removed: number }> {
  const retired: Record<string, string> = { ...(previous?.retired ?? {}) };
  const live = (key: string) => Boolean(files[key]) || assets.current.has(key);
  for (const key of [...Object.keys(previous?.files ?? {}), ...assets.stored]) {
    if (!live(key) && !retired[key]) retired[key] = now.toISOString();
  }
  let removed = 0;
  for (const [key, since] of Object.entries(retired)) {
    if (live(key)) {
      delete retired[key];
    } else if (now.getTime() - Date.parse(since) >= RETIRED_KEEP_MS) {
      await store.remove(key);
      delete retired[key];
      removed += 1;
    }
  }
  return { retired, removed };
}

/**
 * The assets of the build, added to the store: earlier builds' stay for their pages. Resolves
 * with the keys of this build's assets, those the store had before, and how many were added.
 */
async function publishAssets(
  runtimeDir: string,
  store: StaticStore
): Promise<{ current: Set<string>; stored: string[]; written: number }> {
  const dir = path.join(runtimeDir, 'build/client/assets');
  const stored = await store.list(STATIC_ASSETS_PREFIX);
  const existing = new Set(stored);
  const current = new Set<string>();
  let written = 0;
  for (const name of await readdir(dir)) {
    const key = `${STATIC_ASSETS_PREFIX}${name}`;
    current.add(key);
    if (existing.has(key)) continue;
    await store.write(
      key,
      await readFile(path.join(dir, name)),
      contentTypeOf(key)
    );
    written += 1;
  }
  return { current, stored, written };
}

/** `robots.txt`, the sitemap index and its files, as the app answers them. */
async function renderSeoFiles(
  renderer: ReturnType<typeof createStaticRenderer>,
  writer: SiteWriter,
  now: Date,
  logger: Pick<Console, 'warn'>
): Promise<void> {
  const write = async (pathname: string): Promise<string | null> => {
    const response = await renderer.fetch(pathname);
    if (response.status !== 200) {
      await response.body?.cancel();
      logger.warn(`[static] ${pathname}: ${response.status}, not written`);
      return null;
    }
    const body = await response.text();
    await writer.writeFile(pathname.slice(1), body, {
      kind: 'seo',
      path: pathname,
      status: 200,
      renderedAt: now.toISOString(),
    });
    return body;
  };
  await write('/robots.txt');
  const index = await write('/sitemap.xml');
  for (const match of index?.matchAll(/<loc>([^<]+)<\/loc>/g) ?? []) {
    const pathname = new URL(match[1]).pathname;
    if (/^\/sitemaps\/[^/]+\.xml$/.test(pathname)) await write(pathname);
  }
}

/**
 * Renders the static site of a theme: the addresses of its config in each of its languages,
 * the shells and the family shells, the 404 page, `robots.txt` and the sitemaps, and the
 * assets of the build, then the manifest. A page that answers 404 is not written (and its
 * file of an earlier build retires); a redirect is an error of the config.
 */
export async function buildStaticSite(
  options: StaticBuildOptions
): Promise<StaticBuildReport> {
  const { store, logger = console, now = () => new Date() } = options;
  const started = now();
  const build = options.build ?? (await loadBuild(options.runtimeDir));
  const site = staticSiteOf(build);
  const { config } = site;
  const concurrency =
    options.concurrency ??
    config.concurrency ??
    Math.max(1, os.availableParallelism() - 1);
  const previous = await readManifest(store);
  const { all, rendered } = await site.locales();
  const prefix = site.routing.localePrefix;

  const tasks: RenderTask[] = [];
  const addTask = (
    pathname: string,
    locale: StorefrontLocale,
    mode: StaticRenderMode,
    kind: StaticManifestFile['kind'],
    key?: string,
    expectedStatus = 200
  ) => {
    const served = localizedPath(pathname, locale, all, prefix);
    const fileKey = key ?? staticKeyForPath(served);
    if (!fileKey) {
      logger.warn(
        `[static] ${served}: not an address of the static site, skipped`
      );
      return;
    }
    tasks.push({
      request: { path: served, mode, localeTag: locale.tag },
      kind,
      locale: locale.segment,
      key: fileKey,
      expectedStatus,
    });
  };

  for (const locale of rendered) {
    const routes = await site.routes(locale);
    logger.info(`[static] ${locale.segment}: ${routes.length} pages`);
    for (const route of routes) addTask(route.path, locale, 'page', 'page');
    for (const shell of config.shells ?? [])
      addTask(shell, locale, 'shell', 'shell');
  }
  // One shell per family and one 404 page, in the default language: what an address without
  // a file gets when no server renders.
  const defaultLocale = all.defaultLocale;
  for (const family of new Set(Object.values(STATIC_SHELL_FAMILIES))) {
    addTask(
      FAMILY_SHELL_PATHS[family],
      defaultLocale,
      'shell',
      'family-shell',
      staticShellKey(family)
    );
  }
  if (config.notFound) {
    addTask(
      NOT_FOUND_PATH,
      defaultLocale,
      'page',
      'not-found',
      STATIC_NOT_FOUND_KEY,
      404
    );
  }

  const writer = new SiteWriter(store, previous, build.assets.version);
  const failed: StaticBuildReport['failed'] = [];
  const unpublished = new Set<string>();
  const renderer = openRenderer(
    options,
    build,
    concurrency,
    config.pagesPerWorker ?? 200
  );
  let pages = 0;
  let shells = 0;
  try {
    await forEachLimited(tasks, concurrency, async (task) => {
      try {
        const result = await renderer.render(task.request);
        if (result.status === task.expectedStatus && result.html) {
          await writer.writePage(task, result);
          if (task.kind === 'page') pages += 1;
          else shells += 1;
          return;
        }
        if (task.kind === 'page' && result.status === 404) {
          // The API does not show the page to a guest: no file, and an earlier one goes now,
          // the server renders the address (its 404) instead.
          logger.warn(`[static] ${task.request.path}: 404, not published`);
          const earlier = previous?.files[task.key];
          if (earlier) {
            await store.remove(task.key);
            if (earlier.data) await store.remove(earlier.data);
            unpublished.add(task.key);
            if (earlier.data) unpublished.add(earlier.data);
          }
          return;
        }
        failed.push({
          path: task.request.path,
          reason:
            result.status >= 300 && result.status < 400
              ? `redirects to ${result.location} (the config names a non-canonical address)`
              : `answered ${result.status}`,
        });
      } catch (error) {
        failed.push({
          path: task.request.path,
          reason: error instanceof Error ? error.message : String(error),
        });
      }
    });
  } finally {
    await renderer.close();
  }

  await renderSeoFiles(
    createStaticRenderer(build, { origin: options.origin }),
    writer,
    started,
    logger
  );
  const assets = await publishAssets(options.runtimeDir, store);
  const { retired, removed } = await retireStale(
    store,
    previous && {
      ...previous,
      files: Object.fromEntries(
        Object.entries(previous.files).filter(([key]) => !unpublished.has(key))
      ),
    },
    writer.files,
    assets,
    started
  );
  const manifest: StaticManifest = {
    version: STATIC_MANIFEST_VERSION,
    buildId: build.assets.version,
    builtAt: started.toISOString(),
    locales: all.locales.map((locale) => locale.segment.toLowerCase()),
    files: writer.files,
    retired,
  };
  await store.write(
    STATIC_MANIFEST_KEY,
    JSON.stringify(manifest),
    contentTypeOf(STATIC_MANIFEST_KEY)
  );
  const report: StaticBuildReport = {
    pages,
    shells,
    skipped: writer.skipped,
    removed: removed + unpublished.size,
    failed,
    durationMs: now().getTime() - started.getTime(),
    manifest,
  };
  logger.info(
    `[static] ${pages} pages, ${shells} shells, ${writer.written} files written, ` +
      `${writer.skipped} unchanged, ${assets.written} assets added, ` +
      `${removed + unpublished.size} old files removed, ` +
      `${failed.length} failed in ${(report.durationMs / 1000).toFixed(1)} s to ${store.url}`
  );
  for (const failure of failed) {
    logger.error(`[static] ${failure.path}: ${failure.reason}`);
  }
  return report;
}

/**
 * Renders some addresses again (as served: `/uk/products/x`) into a site the store has: their
 * files and data renewed, the manifest updated. A page that now answers 404 leaves the site.
 */
export async function renderStaticPaths(
  options: StaticBuildOptions & { paths: readonly string[] }
): Promise<StaticBuildReport> {
  const { store, logger = console, now = () => new Date() } = options;
  const started = now();
  const build = options.build ?? (await loadBuild(options.runtimeDir));
  const site = staticSiteOf(build);
  const previous = await readManifest(store);
  if (!previous) {
    throw new Error(
      `${store.url} has no static site: run "static build" first`
    );
  }
  const { all } = await site.locales();
  const writer = new SiteWriter(store, previous, build.assets.version);
  const renderer = createStaticRenderer(build, {
    origin: options.origin,
    now: options.now,
  });
  const failed: StaticBuildReport['failed'] = [];
  const files = { ...previous.files };
  let pages = 0;
  let removed = 0;

  await forEachLimited(
    options.paths,
    options.concurrency ?? 4,
    async (address) => {
      const served = servedPath(address);
      const key = staticKeyForPath(served);
      if (!key) {
        failed.push({
          path: address,
          reason: 'not an address of the static site',
        });
        return;
      }
      const first = served.split('/')[1]?.toLowerCase() ?? '';
      const locale =
        all.locales.find((item) => item.segment.toLowerCase() === first) ??
        all.defaultLocale;
      let result: StaticRenderResult;
      try {
        result = await renderer.render({
          path: served,
          mode: 'page',
          localeTag: locale.tag,
        });
      } catch (error) {
        failed.push({
          path: served,
          reason: error instanceof Error ? error.message : String(error),
        });
        return;
      }
      if (result.status === 200) {
        const request = {
          path: served,
          mode: 'page',
          localeTag: locale.tag,
        } as const;
        await writer.writePage(
          {
            request,
            kind: 'page',
            locale: locale.segment,
            key,
            expectedStatus: 200,
          },
          result
        );
        pages += 1;
        return;
      }
      if (result.status === 404 && files[key]) {
        const dataKey = files[key].data;
        delete files[key];
        await store.remove(key);
        if (dataKey) {
          delete files[dataKey];
          await store.remove(dataKey);
        }
        removed += 1;
        return;
      }
      failed.push({ path: served, reason: `answered ${result.status}` });
    }
  );

  await publishAssets(options.runtimeDir, store);
  const manifest: StaticManifest = {
    ...previous,
    buildId: build.assets.version,
    files: { ...files, ...writer.files },
  };
  await store.write(
    STATIC_MANIFEST_KEY,
    JSON.stringify(manifest),
    contentTypeOf(STATIC_MANIFEST_KEY)
  );
  const report: StaticBuildReport = {
    pages,
    shells: 0,
    skipped: writer.skipped,
    removed,
    failed,
    durationMs: now().getTime() - started.getTime(),
    manifest,
  };
  logger.info(
    `[static] ${pages} pages rendered, ${removed} removed, ${failed.length} failed to ${store.url}`
  );
  for (const failure of failed)
    logger.error(`[static] ${failure.path}: ${failure.reason}`);
  return report;
}

/**
 * Copies a static site from one store to another (a directory to the bucket): the files of
 * its manifest and its assets, the manifest last; files the target's earlier site had and this
 * one has not retire as in a full build.
 */
export async function publishStaticSite({
  from,
  to,
  logger = console,
  now = () => new Date(),
}: {
  from: StaticStore;
  to: StaticStore;
  logger?: Pick<Console, 'info'>;
  now?: () => Date;
}): Promise<{ written: number; skipped: number; removed: number }> {
  const manifest = await readManifest(from);
  if (!manifest) throw new Error(`${from.url} has no static site`);
  const previous = await readManifest(to);
  let written = 0;
  let skipped = 0;
  for (const [key, file] of Object.entries(manifest.files)) {
    if (previous?.files[key]?.hash === file.hash) {
      skipped += 1;
      continue;
    }
    const read = await from.read(key);
    if (read.status !== 'found') throw new Error(`${from.url} misses ${key}`);
    await to.write(key, read.body, file.contentType);
    written += 1;
  }
  const stored = await to.list(STATIC_ASSETS_PREFIX);
  const targetAssets = new Set(stored);
  const current = new Set(await from.list(STATIC_ASSETS_PREFIX));
  for (const key of current) {
    if (targetAssets.has(key)) continue;
    const read = await from.read(key);
    if (read.status === 'found') {
      await to.write(key, read.body, read.contentType);
      written += 1;
    }
  }
  const { retired, removed } = await retireStale(
    to,
    previous,
    manifest.files,
    { stored, current },
    now()
  );
  await to.write(
    STATIC_MANIFEST_KEY,
    JSON.stringify({ ...manifest, retired }),
    contentTypeOf(STATIC_MANIFEST_KEY)
  );
  logger.info(
    `[static] ${written} files published, ${skipped} unchanged, ${removed} old files removed: ${from.url} → ${to.url}`
  );
  return { written, skipped, removed };
}
