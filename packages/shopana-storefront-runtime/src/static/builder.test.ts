import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { data, type ServerBuild } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { StaticManifest } from '@shopana/storefront-sdk/static';
import type { StaticSiteEntry } from '../react-router/static-site';
import {
  buildStaticSite,
  localizedPath,
  publishStaticSite,
  renderStaticPaths,
  staticPageKey,
  type StaticPageResult,
} from './builder';
import { createFsStore, type StaticStore } from './store';
import {
  jobRequest,
  jobTokenSource,
  runStaticJobs,
  type CoordinatorClient,
  type CoordinatorLease,
  type CoordinatorResult,
} from './run';
import { parseDuration } from './cli';

let dir: string;
let catalog: Record<string, { title: string; endsAt?: string }>;
/** Products still listed whose page the API no longer shows a guest. */
let unpublished: Set<string>;
/** Products whose page the API fails to render now. */
let broken: Set<string>;

const en = { code: 'en', tag: 'en', segment: 'en', name: 'English' };
const uk = { code: 'uk', tag: 'uk', segment: 'uk', name: 'Українська' };
const locales = { defaultLocale: en, locales: [en, uk] };

const staticSite: StaticSiteEntry = {
  config: {
    locales: 'all',
    pages: { home: true, product: { enumerate: 'products' } },
    notFound: true,
  },
  routing: { localePrefix: 'as-needed' },
  locales: async () => ({ all: locales, rendered: locales.locales }),
  routes: async () => [
    { path: '/', family: 'home' },
    ...Object.keys(catalog).map((handle) => ({
      path: `/products/${handle}`,
      family: 'product' as const,
    })),
    { path: '/products/hidden', family: 'product' as const },
  ],
};

/** A server build of two routes: a page of the catalog and `robots.txt`. */
function fakeBuild(): ServerBuild {
  const route = (id: string, extra: object) => ({
    id,
    parentId: id === 'root' ? undefined : 'root',
    caseSensitive: false,
    index: undefined,
    ...extra,
  });
  return {
    entry: {
      module: {
        staticSite,
        default: async (
          request: Request,
          status: number,
          headers: Headers,
          context: {
            staticHandlerContext: { loaderData: Record<string, unknown> };
          }
        ) => {
          const page = context.staticHandlerContext.loaderData[
            'routes/page'
          ] as { title: string; endsAt?: string } | undefined;
          const state = page
            ? {
                ROOT_QUERY: {
                  __typename: 'Query',
                  'productByHandle({"handle":"x"})': { __ref: 'Product:1' },
                },
                'Product:1': {
                  __typename: 'Product',
                  id: '1',
                  title: page.title,
                  endsAt: page.endsAt,
                  variant: { __ref: 'ProductVariant:1' },
                },
                'ProductVariant:1': {
                  __typename: 'ProductVariant',
                  id: '1',
                  availableForSale: true,
                },
              }
            : {};
          headers.set('Content-Type', 'text/html');
          return new Response(
            `<html><head><style data-emotion="acss a b">.acss-a{x:y}.acss-b{x:y}</style></head>` +
              `<body><p class="acss-a">${page?.title ?? 'not found'} ${new URL(request.url).pathname}</p>` +
              `<script>window.__shopanaApolloState=${JSON.stringify(state)}</script></body></html>`,
            { status, headers }
          );
        },
      },
    },
    routes: {
      root: route('root', { path: '', module: { default: () => null } }),
      robots: route('robots', {
        path: 'robots.txt',
        module: { loader: () => new Response('User-agent: *\n') },
      }),
      'routes/page': route('routes/page', {
        path: '*',
        module: {
          default: () => null,
          loader: ({ request }: { request: Request }) => {
            const handle = new URL(request.url).pathname.split('/').pop() ?? '';
            const pathname = new URL(request.url).pathname;
            if (pathname === '/' || pathname === '/uk')
              return { title: 'home' };
            if (broken.has(handle)) throw new Error('API down');
            const product = unpublished.has(handle)
              ? undefined
              : catalog[handle];
            if (!product) throw data(null, { status: 404 });
            return product;
          },
        },
      }),
    },
    assets: {
      entry: { imports: [], module: '' },
      routes: {},
      url: '',
      version: 'build-1',
    },
    publicPath: '/',
    assetsBuildDirectory: path.join(dir, 'build/client'),
    future: {},
    ssr: true,
    isSpaMode: false,
    prerender: [],
    routeDiscovery: { mode: 'initial', manifestPath: '/__manifest' },
  } as unknown as ServerBuild;
}

beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), 'storefront-static-'));
  await mkdir(path.join(dir, 'build/client/assets'), { recursive: true });
  await writeFile(path.join(dir, 'build/client/assets/app-1.js'), 'js');
  catalog = {
    socks: { title: 'Socks', endsAt: '2099-01-01T00:00:00.000Z' },
    hats: { title: 'Hats' },
  };
  unpublished = new Set();
  broken = new Set();
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

const quiet = { info: () => {}, warn: () => {}, error: () => {} };

async function build(
  now = new Date('2026-11-06T10:00:00Z'),
  store: StaticStore = createFsStore(path.join(dir, 'build/static'))
) {
  return buildStaticSite({
    runtimeDir: dir,
    store,
    origin: 'https://shop.example',
    inProcess: true,
    build: fakeBuild(),
    logger: quiet,
    now: () => now,
  });
}

const read = (key: string) =>
  readFile(path.join(dir, 'build/static', key), 'utf8');

describe('the static site builder', () => {
  it('localizes addresses by the prefix mode', () => {
    expect(localizedPath('/', en, locales, 'as-needed')).toBe('/');
    expect(localizedPath('/', uk, locales, 'as-needed')).toBe('/uk');
    expect(localizedPath('/cart', en, locales, 'always')).toBe('/en/cart');
  });

  it('writes the pages of every language, 404 and the manifest', async () => {
    const report = await build();
    expect(report.failed).toEqual([]);
    expect(report.pages).toBe(6);

    const page = await read('uk/products/socks/index.html');
    expect(page).toContain('Socks /uk/products/socks');
    // The unused emotion rule is gone; the HTML is the render's, the Apollo state inline.
    expect(page).toContain('<style data-emotion="acss a">.acss-a{x:y}</style>');
    expect(page).not.toContain('__shopanaStatic');
    expect(page).toContain('<script>window.__shopanaApolloState=');
    await expect(read('cart/index.html')).rejects.toThrow();
    expect(await read('404.html')).toContain('not found /__static/not-found');
    expect(await read('robots.txt')).toBe('User-agent: *\n');
    expect(await read('assets/app-1.js')).toBe('js');

    const manifest = JSON.parse(
      await read('__static/manifest.json')
    ) as StaticManifest;
    expect(manifest.locales).toEqual(['en', 'uk']);
    // The server reads its small index, never the manifest.
    expect(JSON.parse(await read('__static/server.json'))).toEqual({
      version: 1,
      buildId: 'build-1',
      locales: ['en', 'uk'],
      statuses: { '404.html': 404 },
    });
    expect(manifest.files['404.html'].status).toBe(404);
    expect(manifest.files['products/socks/index.html']).toMatchObject({
      kind: 'page',
      path: '/products/socks',
      locale: 'en',
      validUntil: '2099-01-01T00:00:00.000Z',
    });
    // A product the API does not show a guest has no file.
    expect(manifest.files['products/hidden/index.html']).toBeUndefined();
  });

  it('renders the same HTML again and keeps the files that did not change', async () => {
    await build();
    const first = await read('products/socks/index.html');
    const report = await build(new Date('2026-11-06T11:00:00Z'));
    expect(await read('products/socks/index.html')).toBe(first);
    expect(report.skipped).toBeGreaterThan(0);
  });

  it('deletes the files of a page that left the catalog at once', async () => {
    await build();
    delete catalog.hats;
    // A file of the site no manifest lists (a writer that stopped halfway), and one that is no
    // file of the site at all.
    await writeFile(path.join(dir, 'build/static/products/orphan.html'), 'x');
    await mkdir(path.join(dir, 'build/static/products/orphan'), {
      recursive: true,
    });
    await writeFile(
      path.join(dir, 'build/static/products/orphan/index.html'),
      'stale'
    );
    const later = await build(new Date('2026-11-07T10:00:00Z'));
    expect(later.manifest.files['products/hats/index.html']).toBeUndefined();
    expect(later.manifest.retired).toEqual({});
    await expect(read('products/hats/index.html')).rejects.toThrow();
    await expect(read('products/orphan/index.html')).rejects.toThrow();
    expect(await read('products/orphan.html')).toBe('x');
    expect(later.removed).toBe(3);
  });

  it('keeps the earlier files of a page that fails now', async () => {
    await build();
    broken.add('socks');
    const later = await build(new Date('2026-11-07T10:00:00Z'));
    expect(later.failed.map((failure) => failure.path)).toEqual([
      '/products/socks',
      '/uk/products/socks',
    ]);
    expect(later.manifest.files['products/socks/index.html']).toMatchObject({
      renderedAt: '2026-11-06T10:00:00.000Z',
    });
    expect(await read('products/socks/index.html')).toContain('Socks');
  });

  it('keeps a page rendered while a full build ran', async () => {
    await build();
    const fsStore = createFsStore(path.join(dir, 'build/static'));
    // A render of one page lands between the full build's read and write of the manifest.
    let rendered = false;
    const store: StaticStore = {
      ...fsStore,
      async write(key, body, contentType, options) {
        if (key === '__static/manifest.json' && !rendered) {
          rendered = true;
          catalog.boots = { title: 'Boots' };
          await renderStaticPaths({
            runtimeDir: dir,
            store: fsStore,
            origin: 'https://shop.example',
            build: fakeBuild(),
            logger: quiet,
            now: () => new Date('2026-11-07T10:30:00Z'),
            paths: ['/products/boots'],
          });
        }
        return fsStore.write(key, body, contentType, options);
      },
    };
    const later = await build(new Date('2026-11-07T10:00:00Z'), store);
    expect(later.manifest.files['products/boots/index.html']).toMatchObject({
      renderedAt: '2026-11-07T10:30:00.000Z',
    });
    expect(await read('products/boots/index.html')).toContain('Boots');
    const manifest = JSON.parse(
      await read('__static/manifest.json')
    ) as StaticManifest;
    expect(manifest.files['products/boots/index.html']).toBeDefined();
    expect(manifest.files['uk/products/socks/index.html']).toBeDefined();
  });

  it('publishes a site to another store and deletes what the target had besides', async () => {
    await build();
    const target = createFsStore(path.join(dir, 'published'));
    await target.write('products/gone/index.html', 'gone', 'text/html');
    await target.write('notes.txt', 'mine', 'text/plain');
    const published = await publishStaticSite({
      from: createFsStore(path.join(dir, 'build/static')),
      to: target,
      logger: quiet,
    });
    expect(published.removed).toBe(1);
    expect((await target.read('products/gone/index.html')).status).toBe(
      'missing'
    );
    expect((await target.read('notes.txt')).status).toBe('found');
    expect((await target.read('__static/server.json')).status).toBe('found');
    expect((await target.read('uk/products/socks/index.html')).status).toBe(
      'found'
    );
  });

  it('renders some addresses again into the site', async () => {
    await build();
    catalog.socks.title = 'Wool socks';
    catalog.boots = { title: 'Boots' };
    const report = await renderStaticPaths({
      runtimeDir: dir,
      store: createFsStore(path.join(dir, 'build/static')),
      origin: 'https://shop.example',
      build: fakeBuild(),
      logger: quiet,
      paths: ['/uk/products/socks', '/products/boots', '/products/never'],
    });
    // An address the site never had a page of that answers 404 is no failure.
    expect(report.failed).toEqual([]);
    expect(await read('uk/products/socks/index.html')).toContain('Wool socks');
    expect(await read('products/boots/index.html')).toContain('Boots');
    const manifest = JSON.parse(
      await read('__static/manifest.json')
    ) as StaticManifest;
    expect(manifest.files['products/boots/index.html'].locale).toBe('en');
    expect(manifest.files['uk/products/hats/index.html']).toBeDefined();
  });

  it('reports every page, unchanged when rendered the same', async () => {
    const results: StaticPageResult[] = [];
    const options = {
      runtimeDir: dir,
      store: createFsStore(path.join(dir, 'build/static')),
      origin: 'https://shop.example',
      inProcess: true,
      build: fakeBuild(),
      logger: quiet,
      onPage: (result: StaticPageResult) => results.push(result),
    };
    await buildStaticSite({
      ...options,
      now: () => new Date('2026-11-06T10:00:00Z'),
    });
    const socks = results.find(
      (result) => result.path === '/uk/products/socks'
    );
    expect(socks).toMatchObject({
      locale: 'uk',
      route: 'product',
      outcome: 'published',
      validUntil: '2099-01-01T00:00:00.000Z',
    });
    expect(
      results.find((result) => result.path === '/products/hidden')?.outcome
    ).toBe('gone');

    results.length = 0;
    await buildStaticSite({
      ...options,
      now: () => new Date('2026-11-07T10:00:00Z'),
    });
    expect(
      results.filter(
        (result) => result.outcome !== 'unchanged' && result.outcome !== 'gone'
      )
    ).toEqual([]);
  });

  it('tags the files for the CDN and purges what changed', async () => {
    const writes = new Map<string, readonly string[] | undefined>();
    const fsStore = createFsStore(path.join(dir, 'build/static'));
    const store: StaticStore = {
      ...fsStore,
      url: fsStore.url,
      kind: 's3',
      read: fsStore.read.bind(fsStore),
      remove: fsStore.remove.bind(fsStore),
      list: fsStore.list.bind(fsStore),
      write: (key, body, contentType, options) => {
        writes.set(key, options?.cacheTags);
        return fsStore.write(key, body, contentType, options);
      },
    };
    await writeFile(path.join(dir, 'build/client/favicon.ico'), 'icon');
    const purged: string[][] = [];
    const purger = {
      purge: async (tags: readonly string[]) => void purged.push([...tags]),
    };
    staticSite.config.publish = { store: 's3', cdn: 'cloudflare' };
    try {
      await buildStaticSite({
        runtimeDir: dir,
        store,
        origin: 'https://shop.example',
        inProcess: true,
        build: fakeBuild(),
        logger: quiet,
        purger,
        now: () => new Date('2026-11-06T10:00:00Z'),
      });
      const tags = [
        `pg:${staticPageKey('uk', '/uk/products/socks')}`,
        'build:build-1',
      ];
      expect(writes.get('uk/products/socks/index.html')).toEqual(tags);
      expect(purged).toEqual([['build:build-1']]);
      // The files of public/ go to the bucket for the CDN.
      expect(writes.has('public/favicon.ico')).toBe(true);
      expect(writes.has('public/assets/app-1.js')).toBe(false);

      catalog.socks.title = 'New socks';
      purged.length = 0;
      await renderStaticPaths({
        runtimeDir: dir,
        store,
        origin: 'https://shop.example',
        build: fakeBuild(),
        logger: quiet,
        purger,
        paths: ['/uk/products/socks', '/products/hats'],
      });
      expect(purged).toEqual([
        [`pg:${staticPageKey('uk', '/uk/products/socks')}`],
      ]);
    } finally {
      delete staticSite.config.publish;
    }
  });

  it('removes the page of a product that answers 404 at once', async () => {
    await build();
    unpublished.add('hats');
    const later = await build(new Date('2026-11-07T10:00:00Z'));
    expect(later.manifest.files['products/hats/index.html']).toBeUndefined();
    expect(
      later.manifest.retired?.['products/hats/index.html']
    ).toBeUndefined();
    await expect(read('products/hats/index.html')).rejects.toThrow();
  });

  it('retires the assets of earlier builds for a week', async () => {
    await build();
    await rm(path.join(dir, 'build/client/assets/app-1.js'));
    await writeFile(path.join(dir, 'build/client/assets/app-2.js'), 'js2');
    const next = await build(new Date('2026-11-07T10:00:00Z'));
    expect(next.manifest.retired?.['assets/app-1.js']).toBe(
      '2026-11-07T10:00:00.000Z'
    );
    expect(await read('assets/app-1.js')).toBe('js');
    await build(new Date('2026-11-14T10:00:00Z'));
    await expect(read('assets/app-1.js')).rejects.toThrow();
    expect(await read('assets/app-2.js')).toBe('js2');
  });

  it('keys an address the way a browser sends it', () => {
    expect(localizedPath('/products/шапка', uk, locales, 'as-needed')).toBe(
      '/uk/products/%D1%88%D0%B0%D0%BF%D0%BA%D0%B0'
    );
  });
});

describe('static run', () => {
  /** A coordinator that hands out the leases given, then empty ones. */
  function coordinator(
    leases: Array<Omit<CoordinatorLease, 'leaseId' | 'expiresAt'>>
  ) {
    const results: CoordinatorResult[] = [];
    const completed: Array<{ leaseId: string; body: unknown }> = [];
    const requests: unknown[] = [];
    let next = 0;
    const client: CoordinatorClient = {
      lease: async (request) => {
        requests.push(request);
        const lease = leases[next] ?? { mode: 'queue', image: null, jobs: [] };
        next += 1;
        return { ...lease, leaseId: `l${next}`, expiresAt: 0 };
      },
      heartbeat: async () => true,
      results: async (_lease, batch) => void results.push(...batch),
      complete: async (leaseId, body) => void completed.push({ leaseId, body }),
    };
    return { client, results, completed, requests };
  }

  const runOptions = () => ({
    runtimeDir: dir,
    store: createFsStore(path.join(dir, 'build/static')),
    origin: 'https://shop.example',
    inProcess: true,
    build: fakeBuild(),
    logger: quiet,
    budgetMs: parseDuration('35m'),
  });

  it('renders the jobs of its leases and returns their results', async () => {
    await build();
    catalog.socks.title = 'Wool socks';
    const { client, results, completed, requests } = coordinator([
      {
        mode: 'queue',
        image: null,
        jobs: [
          {
            id: 1,
            locale: 'en',
            target: 'path:/products/socks',
            path: '/products/socks',
            htmlHash: null,
          },
          {
            id: 3,
            locale: 'en',
            target: 'path:/products/hats',
            path: '/products/hats',
            htmlHash: null,
          },
        ],
      },
    ]);
    const report = await runStaticJobs({
      ...runOptions(),
      coordinator: client,
      requestId: 'd-1',
      runId: '42',
    });
    expect(report).toEqual({ leases: 1, pages: 2, failed: 0 });
    expect(requests[0]).toMatchObject({
      requestId: 'd-1',
      runId: '42',
      capacity: 500,
    });
    expect(requests[1]).not.toHaveProperty('requestId');
    expect(
      results.map((result) => [result.jobIds, result.path, result.outcome])
    ).toEqual(
      expect.arrayContaining([
        [[1], '/products/socks', 'published'],
        [[3], '/products/hats', 'unchanged'],
      ])
    );
    expect(completed).toEqual([
      { leaseId: 'l1', body: {} },
      { leaseId: 'l2', body: {} },
    ]);
  });

  it('builds the whole site for a full lease and names the pages it saw', async () => {
    const { client, results, completed } = coordinator([
      { mode: 'full', image: null, jobs: [] },
    ]);
    await runStaticJobs({ ...runOptions(), coordinator: client });
    expect(results.some((result) => result.path === '/uk/products/socks')).toBe(
      true
    );
    const body = completed[0].body as {
      fullBuild: boolean;
      seenPages: Array<{ locale: string; path: string }>;
    };
    expect(body.fullBuild).toBe(true);
    expect(body.seenPages).toContainEqual({
      locale: 'uk',
      path: '/uk/products/socks',
    });
    expect(body.seenPages).not.toContainEqual({
      locale: 'en',
      path: '/products/hidden',
    });
  });

  it('turns jobs into requests', () => {
    expect(
      jobRequest({
        id: 7,
        locale: 'uk',
        target: 'path:/uk/products/a',
        path: '/uk/products/a',
        htmlHash: null,
      })
    ).toEqual({ locale: 'uk', path: '/uk/products/a', jobIds: [7] });
  });

  it('asks GitHub for its OIDC token with the audience of the coordinator', async () => {
    const urls: string[] = [];
    const token = jobTokenSource(
      {
        ACTIONS_ID_TOKEN_REQUEST_URL: 'https://gh.test/token?x=1',
        ACTIONS_ID_TOKEN_REQUEST_TOKEN: 'rt',
      },
      async (url) => {
        urls.push(String(url));
        return Response.json({ value: 'jwt' });
      }
    );
    expect(await token()).toBe('jwt');
    expect(await token()).toBe('jwt');
    expect(urls).toEqual([
      'https://gh.test/token?x=1&audience=shopana-static-coordinator',
    ]);
  });
});
