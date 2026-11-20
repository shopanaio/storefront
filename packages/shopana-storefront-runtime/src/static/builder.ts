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
  type StaticPageDep,
} from '@shopana/storefront-sdk/static';
import { createHash } from 'node:crypto';
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
import type { StaticPurger } from './purge';

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
  /**
   * Hears of every page of the config rendered (or not), with what it depends on: the
   * results a job of `static run` returns to the coordinator.
   */
  onPage?: (result: StaticPageResult) => void;
  /** Purges the tags of the CDN of what changed (`publish.cdn: 'cloudflare'`). */
  purger?: StaticPurger | null;
}

/** What became of a page a render was asked for. */
export type StaticPageOutcome =
  /** Its HTML or data changed and was written. */
  | 'published'
  /** Rendered the same as the store has it: nothing written, nothing purged. */
  | 'unchanged'
  /** The API does not show it to a guest (or its entity has another address now). */
  | 'gone'
  /** The render failed: the page keeps its earlier files. */
  | 'failed';

/** One page of a render, as `static run` reports it to the coordinator. */
export interface StaticPageResult {
  /** The URL segment of its language. */
  locale: string;
  /** The address as served. */
  path: string;
  /** The page type (`product`, …). */
  route: string;
  /** The entity the page is of, if any. */
  ownerKey: string | null;
  outcome: StaticPageOutcome;
  htmlHash: string | null;
  dataHash: string | null;
  deps: StaticPageDep[];
  /** Entities only the layout shows. */
  layout: string[];
  validUntil: string | null;
  /** When its render started (ms): changes after it are not in the page. */
  renderStartedAt: number;
  error?: string;
  /** The jobs of the coordinator the page was rendered for. */
  jobIds?: number[];
}

/** A page to render again, by its address or by the entity it is of. */
export interface StaticPageRequest {
  /** The address as served (`/uk/products/x`). */
  path?: string;
  /** The URL segment of its language; by the address when it has one. */
  locale?: string;
  /** The entity of the page: its address is looked up when none is given or it changed. */
  owner?: { key: string; id: string; route: string };
  /** The address the page had: gone when the entity's page is elsewhere now. */
  previousPath?: string;
  /** The jobs of the coordinator it is rendered for: carried into its results. */
  jobIds?: number[];
}

/**
 * The key of a page in tags of the CDN (`pg:<pageKey>`): 16 characters of a hash of its
 * language and address, short whatever the address.
 */
export function staticPageKey(locale: string, pathname: string): string {
  return createHash('sha256')
    .update(`${locale}\n${pathname}`)
    .digest('hex')
    .slice(0, 16);
}

/** The tags of the CDN of the files of a page. */
export function staticPageTags(
  locale: string,
  pathname: string,
  buildId: string
): string[] {
  return [`pg:${staticPageKey(locale, pathname)}`, `build:${buildId}`];
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

/** The page type of an address without its locale segment. */
function routeOf(served: string, localeSegments: readonly string[]): string {
  const segments = served.split('/').filter(Boolean);
  const unlocalized =
    segments.length > 0 && localeSegments.includes(segments[0].toLowerCase())
      ? segments.slice(1)
      : segments;
  const pathname = decodeURIComponent(`/${unlocalized.join('/')}`);
  return parseRoute(pathname).pageType;
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
  const { fieldAspects } = staticSiteOf(build).config;
  if (options.inProcess) {
    const renderer = createStaticRenderer(build, {
      origin: options.origin,
      now: options.now,
      fieldAspects,
    });
    return { render: renderer.render, close: async () => {} };
  }
  return createRenderPool({
    size: concurrency,
    pagesPerWorker,
    workerData: {
      serverBuildPath: path.join(options.runtimeDir, 'build/server/index.js'),
      origin: options.origin,
      fieldAspects,
    },
  });
}

/** What a page's write did. */
interface PageWrite {
  htmlHash: string;
  dataHash: string | null;
  /** Its HTML or its data was written. */
  changed: boolean;
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
    private readonly dataPageTypes: readonly string[],
    /** Tags of the CDN in the objects' metadata (`publish.cdn: 'cloudflare'`). */
    private readonly tagged = false,
    /** Prices come with the fast data: the site is in an image. */
    private readonly volatilePrices = false
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

  /** Writes a file unless the store has it; resolves with whether it was written. */
  async writeFile(
    key: string,
    body: string | Buffer,
    entry: Omit<StaticManifestFile, 'hash' | 'contentType'>,
    cacheTags?: readonly string[]
  ): Promise<{ hash: string; written: boolean }> {
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
      return { hash, written: false };
    }
    await this.store.write(
      key,
      body,
      contentType,
      this.tagged && cacheTags ? { cacheTags } : {}
    );
    this.files[key] = { ...entry, hash, contentType };
    this.written += 1;
    return { hash, written: true };
  }

  /**
   * A rendered document and its data. Its hash leaves the static facts out: a page whose
   * content did not change keeps its file (and the moment it was rendered).
   */
  async writePage(
    task: RenderTask,
    result: StaticRenderResult
  ): Promise<PageWrite> {
    const hash = pageHash(result.html, this.dataPageTypes);
    const same = this.unchanged(task.key, hash);
    const renderedAt = same?.renderedAt ?? result.renderedAt;
    const dataKey =
      task.kind === 'page' ? staticDataKeyForPath(task.request.path) : null;
    const tags =
      task.kind === 'page'
        ? staticPageTags(task.locale, task.request.path, this.buildId)
        : [`build:${this.buildId}`];
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
    let changed = false;
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
        ...(this.volatilePrices ? { volatilePrices: true } : {}),
      });
      await this.store.write(
        task.key,
        html,
        entry.contentType,
        this.tagged ? { cacheTags: tags } : {}
      );
      this.written += 1;
      changed = true;
    }
    this.files[task.key] = entry;
    let dataHash: string | null = null;
    if (dataKey && result.state) {
      const data = await this.writeFile(
        dataKey,
        result.state,
        { kind: 'data', status: 200, renderedAt },
        tags
      );
      dataHash = data.hash;
      changed ||= data.written;
    }
    return { htmlHash: hash, dataHash, changed };
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

/** Where the files of the theme's `public/` go in the bucket for the CDN (step B). */
export const STATIC_PUBLIC_PREFIX = 'public/';

/**
 * The files of the theme's `public/` (the browser build without its assets), copied to the
 * bucket under `public/` when a CDN serves them from it (`publish.cdn: 'cloudflare'`, the
 * custom domain of the bucket): a file the bucket has with the same content is not written.
 */
async function publishPublicFiles(
  runtimeDir: string,
  store: StaticStore
): Promise<number> {
  const root = path.join(runtimeDir, 'build/client');
  const stored = new Set(await store.list(STATIC_PUBLIC_PREFIX));
  let written = 0;
  const walk = async (dir: string, prefix: string): Promise<void> => {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const relative = `${prefix}${entry.name}`;
      if (entry.isDirectory()) {
        if (relative === 'assets') continue;
        await walk(path.join(dir, entry.name), `${relative}/`);
        continue;
      }
      const key = `${STATIC_PUBLIC_PREFIX}${relative}`;
      const body = await readFile(path.join(dir, entry.name));
      if (stored.has(key)) {
        const current = await store.read(key);
        if (current.status === 'found' && current.body.equals(body)) continue;
      }
      await store.write(key, body, contentTypeOf(key));
      written += 1;
    }
  };
  await walk(root, '');
  return written;
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
      request: {
        path: served,
        mode,
        localeTag: locale.tag,
        translated: locale.segment !== all.defaultLocale.segment,
      },
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
  const tagged = config.publish?.cdn === 'cloudflare';
  const writer = new SiteWriter(
    store,
    previous,
    build.assets.version,
    pageTypes,
    tagged,
    store.kind === 'fs'
  );
  const localeSegments = all.locales.map((locale) =>
    locale.segment.toLowerCase()
  );
  const report = (
    task: RenderTask,
    started: number,
    outcome: StaticPageOutcome,
    result?: StaticRenderResult,
    write?: PageWrite,
    error?: string
  ) => {
    if (task.kind !== 'page' || !options.onPage) return;
    options.onPage({
      locale: task.locale,
      path: task.request.path,
      route: routeOf(task.request.path, localeSegments),
      ownerKey: result?.deps.owner ?? null,
      outcome,
      htmlHash: write?.htmlHash ?? null,
      dataHash: write?.dataHash ?? null,
      deps: result?.deps.deps ?? [],
      layout: result?.deps.layout ?? [],
      validUntil: result?.validUntil ?? null,
      renderStartedAt: started,
      ...(error ? { error } : {}),
    });
  };
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
  const fail = (task: RenderTask, reason: string, started: number) => {
    failed.push({ path: task.request.path, reason });
    if (writer.keep(task.key)) kept += 1;
    report(task, started, 'failed', undefined, undefined, reason);
  };
  try {
    await forEachLimited(tasks, concurrency, async (task) => {
      const taskStarted = now().getTime();
      try {
        const result = await renderer.render(task.request);
        if (result.status === task.expectedStatus && result.html) {
          const write = await writer.writePage(task, result);
          if (task.kind === 'page') pages += 1;
          else shells += 1;
          report(
            task,
            taskStarted,
            write.changed ? 'published' : 'unchanged',
            result,
            write
          );
          return;
        }
        if (task.kind === 'page' && result.status === 404) {
          // The API does not show the page to a guest: no file, an earlier one goes with the
          // files the manifest does not list, and the server renders the address (its 404).
          logger.warn(`[static] ${task.request.path}: 404, not published`);
          report(task, taskStarted, 'gone', result);
          return;
        }
        fail(
          task,
          result.status >= 300 && result.status < 400
            ? `redirects to ${result.location} (the config names a non-canonical address)`
            : `answered ${result.status}`,
          taskStarted
        );
      } catch (error) {
        fail(
          task,
          error instanceof Error ? error.message : String(error),
          taskStarted
        );
      }
    });
  } finally {
    await renderer.close();
  }

  await renderSeoFiles(
    createStaticRenderer(build, {
      origin: options.origin,
      fieldAspects: config.fieldAspects,
    }),
    writer,
    started,
    logger
  );
  const assets = await publishAssets(options.runtimeDir, store);
  if (tagged) await publishPublicFiles(options.runtimeDir, store);
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
  if (tagged && options.purger) {
    // Every file of the site carries the tag of the build it was written by.
    const builds = new Set([build.assets.version]);
    if (previous?.buildId) builds.add(previous.buildId);
    await options.purger
      .purge([...builds].map((id) => `build:${id}`))
      .catch((error: unknown) =>
        logger.warn(`[static] purging the CDN failed: ${String(error)}`)
      );
  }
  const buildReport: StaticBuildReport = {
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
      `in ${(buildReport.durationMs / 1000).toFixed(1)} s to ${store.url}`
  );
  for (const failure of failed) {
    logger.error(`[static] ${failure.path}: ${failure.reason}`);
  }
  return buildReport;
}

/** What a render of some pages did. */
export interface StaticPagesReport extends StaticBuildReport {
  results: StaticPageResult[];
  /** Tags of the CDN of the pages it changed (`pg:<pageKey>`), purged when it can. */
  changedTags: string[];
}

/**
 * Renders some pages again into a site the store has: by their address (as served:
 * `/uk/products/x`), or by the entity they are of, whose address is looked up when the request
 * has none (a new product) and whose earlier address leaves the site when it changed (a new
 * handle). A page rendered the same as the store has it is not written (`unchanged`); one that
 * now answers 404 leaves the site (`gone`); one that fails keeps its files. The manifest is
 * updated over the version read, the tags of the changed pages are purged.
 */
export async function renderStaticPages(
  options: StaticBuildOptions & { pages: readonly StaticPageRequest[] }
): Promise<StaticPagesReport> {
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
  const localeSegments = all.locales.map((locale) =>
    locale.segment.toLowerCase()
  );
  const tagged = site.config.publish?.cdn === 'cloudflare';
  const writer = new SiteWriter(
    store,
    previous,
    build.assets.version,
    previous.dataPageTypes,
    tagged,
    store.kind === 'fs'
  );
  const renderer = openRenderer(
    options,
    build,
    options.concurrency ?? site.config.concurrency ?? 4,
    site.config.pagesPerWorker ?? 200
  );
  const failed: StaticBuildReport['failed'] = [];
  const results: StaticPageResult[] = [];
  const changedTags = new Set<string>();
  /** Keys of pages that left the site, and their data. */
  const gone = new Set<string>();
  let pages = 0;

  const localeOf = (request: StaticPageRequest, served?: string) => {
    const wanted = (
      request.locale ??
      served?.split('/')[1] ??
      ''
    ).toLowerCase();
    return (
      all.locales.find((item) => item.segment.toLowerCase() === wanted) ??
      all.defaultLocale
    );
  };

  /** Takes a page of the site away: its files and its entry go. */
  const remove = async (
    served: string,
    locale: string,
    startedAt: number,
    out: StaticPageResult[]
  ) => {
    const key = staticKeyForPath(served);
    const file = key ? previous.files[key] : undefined;
    if (key && file) {
      gone.add(key);
      await store.remove(key);
      if (file.data) {
        gone.add(file.data);
        await store.remove(file.data);
      }
      changedTags.add(`pg:${staticPageKey(locale, served)}`);
    }
    out.push({
      locale,
      path: served,
      route: routeOf(served, localeSegments),
      ownerKey: null,
      outcome: 'gone',
      htmlHash: null,
      dataHash: null,
      deps: [],
      layout: [],
      validUntil: null,
      renderStartedAt: startedAt,
    });
  };

  const renderOne = async (request: StaticPageRequest) => {
    const out: StaticPageResult[] = [];
    try {
      await renderRequest(request, out);
    } finally {
      for (const result of out) {
        results.push(
          request.jobIds ? { ...result, jobIds: request.jobIds } : result
        );
      }
    }
  };

  const renderRequest = async (
    request: StaticPageRequest,
    out: StaticPageResult[]
  ) => {
    const startedAt = now().getTime();
    const locale = localeOf(request, request.path ?? request.previousPath);
    const failure = (served: string, reason: string) => {
      failed.push({ path: served, reason });
      out.push({
        locale: locale.segment,
        path: served,
        route: routeOf(served, localeSegments),
        ownerKey: request.owner?.key ?? null,
        outcome: 'failed',
        htmlHash: null,
        dataHash: null,
        deps: [],
        layout: [],
        validUntil: null,
        renderStartedAt: startedAt,
        error: reason,
      });
    };
    let served = request.path ? servedPath(request.path) : null;
    if (request.owner) {
      let address: string | null;
      try {
        address = await site.ownerPath(
          locale,
          request.owner.id,
          request.owner.route
        );
      } catch (error) {
        failure(
          request.path ?? request.previousPath ?? request.owner.key,
          error instanceof Error ? error.message : String(error)
        );
        return;
      }
      const localized = address
        ? localizedPath(address, locale, all, site.routing.localePrefix)
        : null;
      const earlier = request.previousPath ?? request.path ?? null;
      if (earlier && earlier !== localized) {
        await remove(servedPath(earlier), locale.segment, startedAt, out);
      }
      served = localized;
      // The API shows the entity to no guest: its page is gone, there is none to render.
      if (!served) return;
    }
    if (!served) return;
    const key = staticKeyForPath(served);
    if (!key) {
      failure(served, 'not an address of the static site');
      return;
    }
    const task: RenderTask = {
      request: {
        path: served,
        mode: 'page',
        localeTag: locale.tag,
        translated: locale.segment !== all.defaultLocale.segment,
      },
      kind: 'page',
      locale: locale.segment,
      key,
      expectedStatus: 200,
    };
    let result: StaticRenderResult;
    try {
      result = await renderer.render(task.request);
    } catch (error) {
      failure(served, error instanceof Error ? error.message : String(error));
      return;
    }
    if (result.status === 200 && result.html) {
      const write = await writer.writePage(task, result);
      pages += 1;
      if (write.changed) {
        changedTags.add(`pg:${staticPageKey(locale.segment, served)}`);
      }
      out.push({
        locale: locale.segment,
        path: served,
        route: routeOf(served, localeSegments),
        ownerKey: result.deps.owner ?? request.owner?.key ?? null,
        outcome: write.changed ? 'published' : 'unchanged',
        htmlHash: write.htmlHash,
        dataHash: write.dataHash,
        deps: result.deps.deps,
        layout: result.deps.layout,
        validUntil: result.validUntil,
        renderStartedAt: startedAt,
      });
      return;
    }
    if (result.status === 404) {
      await remove(served, locale.segment, startedAt, out);
      return;
    }
    failure(
      served,
      result.status >= 300 && result.status < 400
        ? `redirects to ${result.location}`
        : `answered ${result.status}`
    );
  };

  try {
    await forEachLimited(
      options.pages,
      options.concurrency ?? site.config.concurrency ?? 4,
      renderOne
    );
  } finally {
    await renderer.close();
  }

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
  if (tagged && options.purger && changedTags.size > 0) {
    await options.purger
      .purge([...changedTags])
      .catch((error: unknown) =>
        logger.warn(`[static] purging the CDN failed: ${String(error)}`)
      );
  }
  const removed = [...gone].filter(
    (key) => previous.files[key]?.kind === 'page'
  ).length;
  const report: StaticPagesReport = {
    pages,
    shells: 0,
    skipped: writer.skipped,
    removed,
    failed,
    durationMs: now().getTime() - started.getTime(),
    manifest,
    results,
    changedTags: [...changedTags],
  };
  const unchanged = results.filter(
    (result) => result.outcome === 'unchanged'
  ).length;
  logger.info(
    `[static] ${pages} pages rendered (${unchanged} unchanged), ${removed} removed, ` +
      `${failed.length} failed to ${store.url}`
  );
  for (const failure of failed)
    logger.error(`[static] ${failure.path}: ${failure.reason}`);
  return report;
}

/**
 * Renders some addresses again (as served: `/uk/products/x`) into a site the store has: their
 * files and data renewed, the manifest updated. A page of the site that now answers 404 leaves
 * it; an address the site has no page of and that answers 404 is left alone.
 */
export function renderStaticPaths(
  options: StaticBuildOptions & { paths: readonly string[] }
): Promise<StaticPagesReport> {
  return renderStaticPages({
    ...options,
    inProcess: options.inProcess ?? true,
    pages: options.paths.map((path) => ({ path })),
  });
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
