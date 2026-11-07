/**
 * The static site builder: every address of a theme's static config rendered by its server
 * build, as a guest, into a store (a directory or a bucket), with the data of each page, the
 * shells, the 404 page, `robots.txt` and the sitemaps, the assets of the build, and the
 * manifest last. A full build replaces the site: a page it no longer has is deleted with it.
 * `renderStaticPaths` adds or renews pages. The manifest is written only over the version a
 * writer read, so a build and a render at the same time both keep what they wrote.
 */
import { readdir, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { ServerBuild } from 'react-router';
import {
  parseRoute,
  type StorefrontLocale,
  type StorefrontLocales,
} from '@shopana/storefront-sdk/routing';
import {
  STATIC_MANIFEST_VERSION,
  staticServerIndex,
  type StaticManifest,
  type StaticManifestFile,
} from '@shopana/storefront-sdk/static';
import type { StaticSiteEntry } from '../react-router/static-site';
import type { StaticRenderMode } from '../react-router/static-render';
import {
  isStaticSiteKey,
  STATIC_ASSETS_PREFIX,
  STATIC_MANIFEST_KEY,
  STATIC_NOT_FOUND_KEY,
  STATIC_SERVER_INDEX_KEY,
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
import {
  contentHash,
  contentTypeOf,
  StaticWriteConflict,
  type StaticStore,
} from './store';

/** Assets of an earlier build this one does not ship are deleted after this. */
const RETIRED_KEEP_MS = 7 * 24 * 60 * 60 * 1000;

/** Writes of the manifest a writer tries before it gives up on writers in between. */
const MANIFEST_ATTEMPTS = 5;

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

/** The manifest of a store as a writer read it: its version (ETag) is what it writes over. */
interface ManifestRead {
  /** Null without one, or with one of another version of the format. */
  manifest: StaticManifest | null;
  /** Null when the store has no manifest. */
  etag: string | null;
}

/** Reads the manifest of a store. */
export async function readManifest(store: StaticStore): Promise<ManifestRead> {
  const read = await store.read(STATIC_MANIFEST_KEY);
  if (read.status !== 'found') return { manifest: null, etag: null };
  const manifest = JSON.parse(read.body.toString('utf8')) as StaticManifest;
  return {
    manifest: manifest.version === STATIC_MANIFEST_VERSION ? manifest : null,
    etag: read.etag,
  };
}

/**
 * Writes the manifest `next` makes of the store's current one, only over the version read
 * (compare and swap): when another writer was first, its manifest is read again and `next`
 * makes the manifest anew from it. Then the server's index of it.
 */
async function commitManifest(
  store: StaticStore,
  read: ManifestRead,
  next: (current: StaticManifest | null) => StaticManifest
): Promise<StaticManifest> {
  let current = read;
  for (let attempt = 1; ; attempt += 1) {
    const manifest = next(current.manifest);
    try {
      await store.write(
        STATIC_MANIFEST_KEY,
        JSON.stringify(manifest),
        contentTypeOf(STATIC_MANIFEST_KEY),
        current.etag ? { ifMatch: current.etag } : { ifNoneMatch: '*' }
      );
    } catch (error) {
      if (!(error instanceof StaticWriteConflict)) throw error;
      if (attempt >= MANIFEST_ATTEMPTS) {
        throw new Error(
          `${store.url}: the manifest kept changing while it was written (${attempt} attempts)`
        );
      }
      current = await readManifest(store);
      continue;
    }
    await store.write(
      STATIC_SERVER_INDEX_KEY,
      JSON.stringify(staticServerIndex(manifest)),
      contentTypeOf(STATIC_SERVER_INDEX_KEY)
    );
    return manifest;
  }
}

/** The hash of a rendered page with what its static facts add to it. */
function pageHash(html: string, dataPageTypes: readonly string[]): string {
  return contentHash(`${html}\n${dataPageTypes.join(',')}`);
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
    private readonly buildId: string,
    private readonly dataPageTypes: readonly string[]
  ) {}

  /**
   * The files of the previous build of a page that failed now: kept as they are, so a
   * failure of the API never takes a page away.
   */
  keep(key: string): boolean {
    const file = this.previous?.files[key];
    if (!file) return false;
    this.files[key] = file;
    const data = file.data && this.previous?.files[file.data];
    if (file.data && data) this.files[file.data] = data;
    return true;
  }

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
    const hash = pageHash(result.html, this.dataPageTypes);
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
        dataPageTypes: [...this.dataPageTypes],
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
 * Retires the assets of earlier builds this one does not ship: one stays for a week (an HTML
 * in a browser's cache still names it), then goes; one that comes back is no longer retired.
 */
async function retireAssets(
  store: StaticStore,
  previous: Record<string, string> | undefined,
  assets: { stored: readonly string[]; current: ReadonlySet<string> },
  now: Date
): Promise<{ retired: Record<string, string>; removed: number }> {
  const retired: Record<string, string> = {};
  for (const [key, since] of Object.entries(previous ?? {})) {
    if (key.startsWith(STATIC_ASSETS_PREFIX)) retired[key] = since;
  }
  for (const key of assets.stored) {
    if (!assets.current.has(key) && !retired[key]) {
      retired[key] = now.toISOString();
    }
  }
  let removed = 0;
  for (const [key, since] of Object.entries(retired)) {
    if (assets.current.has(key)) {
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
 * Deletes the files of the site the manifest does not list: a page that left the catalog, its
 * data, a file a writer left behind. At once: the server answers whatever the store has, so a
 * page kept would stay on sale. Only the builder's own files (`isStaticSiteKey`) are deleted.
 */
async function removeUnlisted(
  store: StaticStore,
  files: Readonly<Record<string, StaticManifestFile>>
): Promise<number> {
  let removed = 0;
  for (const key of await store.list()) {
    if (files[key] || !isStaticSiteKey(key)) continue;
    await store.remove(key);
    removed += 1;
  }
  return removed;
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
 * assets of the build, then the manifest. A page that answers 404 is not written, and the file
 * of an earlier build goes with every other file the new manifest does not list. A page that
 * fails keeps its earlier files. A redirect is an error of the config.
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
  const read = await readManifest(store);
  const previous = read.manifest;
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

  // The page types of the rendered addresses: a client navigation asks for the data of these.
  const dataPageTypes = new Set<string>();
  for (const locale of rendered) {
    const routes = await site.routes(locale);
    logger.info(`[static] ${locale.segment}: ${routes.length} pages`);
    for (const route of routes) {
      addTask(route.path, locale, 'page', 'page');
      const { pageType } = parseRoute(route.path);
      if (pageType !== '404') dataPageTypes.add(pageType);
    }
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

  const pageTypes = [...dataPageTypes].sort();
  const writer = new SiteWriter(
    store,
    previous,
    build.assets.version,
    pageTypes
  );
  const failed: StaticBuildReport['failed'] = [];
  const renderer = openRenderer(
    options,
    build,
    concurrency,
    config.pagesPerWorker ?? 200
  );
  let pages = 0;
  let shells = 0;
  let kept = 0;
  const fail = (task: RenderTask, reason: string) => {
    failed.push({ path: task.request.path, reason });
    if (writer.keep(task.key)) kept += 1;
  };
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
          // The API does not show the page to a guest: no file, an earlier one goes with the
          // files the manifest does not list, and the server renders the address (its 404).
          logger.warn(`[static] ${task.request.path}: 404, not published`);
          return;
        }
        fail(
          task,
          result.status >= 300 && result.status < 400
            ? `redirects to ${result.location} (the config names a non-canonical address)`
            : `answered ${result.status}`
        );
      } catch (error) {
        fail(task, error instanceof Error ? error.message : String(error));
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
  const { retired, removed: removedAssets } = await retireAssets(
    store,
    previous?.retired,
    assets,
    started
  );
  const manifest = await commitManifest(store, read, (current) => {
    const files = { ...writer.files };
    // A page rendered since this build began (`static render`) is newer than this build's.
    for (const [key, file] of Object.entries(current?.files ?? {})) {
      const renderedAt = Date.parse(file.renderedAt);
      if (
        renderedAt > started.getTime() &&
        (!files[key] || renderedAt > Date.parse(files[key].renderedAt))
      ) {
        files[key] = file;
      }
    }
    return {
      version: STATIC_MANIFEST_VERSION,
      buildId: build.assets.version,
      builtAt: started.toISOString(),
      locales: all.locales.map((locale) => locale.segment.toLowerCase()),
      dataPageTypes: pageTypes,
      files,
      retired,
    };
  });
  const removed = removedAssets + (await removeUnlisted(store, manifest.files));
  const report: StaticBuildReport = {
    pages,
    shells,
    skipped: writer.skipped,
    removed,
    failed,
    durationMs: now().getTime() - started.getTime(),
    manifest,
  };
  logger.info(
    `[static] ${pages} pages, ${shells} shells, ${writer.written} files written, ` +
      `${writer.skipped} unchanged, ${assets.written} assets added, ` +
      `${removed} old files removed, ${failed.length} failed (${kept} kept from the last build) ` +
      `in ${(report.durationMs / 1000).toFixed(1)} s to ${store.url}`
  );
  for (const failure of failed) {
    logger.error(`[static] ${failure.path}: ${failure.reason}`);
  }
  return report;
}

/**
 * Renders some addresses again (as served: `/uk/products/x`) into a site the store has: their
 * files and data renewed, the manifest updated. A page of the site that now answers 404 leaves
 * it; an address the site has no page of and that answers 404 is left alone.
 */
export async function renderStaticPaths(
  options: StaticBuildOptions & { paths: readonly string[] }
): Promise<StaticBuildReport> {
  const { store, logger = console, now = () => new Date() } = options;
  const started = now();
  const build = options.build ?? (await loadBuild(options.runtimeDir));
  const site = staticSiteOf(build);
  const read = await readManifest(store);
  const previous = read.manifest;
  if (!previous) {
    throw new Error(
      `${store.url} has no static site: run "static build" first`
    );
  }
  const { all } = await site.locales();
  const writer = new SiteWriter(
    store,
    previous,
    build.assets.version,
    previous.dataPageTypes
  );
  const renderer = createStaticRenderer(build, {
    origin: options.origin,
    now: options.now,
  });
  const failed: StaticBuildReport['failed'] = [];
  /** Keys of pages that left the site, and their data. */
  const gone = new Set<string>();
  let pages = 0;

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
      if (result.status === 404) {
        const file = previous.files[key];
        if (!file) return;
        gone.add(key);
        await store.remove(key);
        if (file.data) {
          gone.add(file.data);
          await store.remove(file.data);
        }
        return;
      }
      failed.push({ path: served, reason: `answered ${result.status}` });
    }
  );

  await publishAssets(options.runtimeDir, store);
  const manifest = await commitManifest(store, read, (current) => {
    const base = current ?? previous;
    const files = { ...base.files };
    for (const key of gone) delete files[key];
    return {
      ...base,
      buildId: build.assets.version,
      files: { ...files, ...writer.files },
    };
  });
  const removed = [...gone].filter(
    (key) => previous.files[key]?.kind === 'page'
  ).length;
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
 * its manifest and its assets, the manifest last. Files of the target's earlier site this one
 * has not are deleted, its old assets retire as in a full build.
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
  const { manifest } = await readManifest(from);
  if (!manifest) throw new Error(`${from.url} has no static site`);
  const target = await readManifest(to);
  const previous = target.manifest;
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
  const { retired, removed: removedAssets } = await retireAssets(
    to,
    previous?.retired,
    { stored, current },
    now()
  );
  // The site published is the source's whole: it replaces whatever the target has now.
  const published = await commitManifest(to, target, () => ({
    ...manifest,
    retired,
  }));
  const removed = removedAssets + (await removeUnlisted(to, published.files));
  logger.info(
    `[static] ${written} files published, ${skipped} unchanged, ${removed} old files removed: ${from.url} → ${to.url}`
  );
  return { written, skipped, removed };
}
