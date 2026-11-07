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
} from './builder';
import { createFsStore, type StaticStore } from './store';

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
    shells: ['/cart'],
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
          const shell =
            request.headers.get('x-shopana-static-render') === 'shell';
          const state = page
            ? {
                'Product:1': {
                  __typename: 'Product',
                  id: '1',
                  title: page.title,
                  endsAt: page.endsAt,
                },
              }
            : {};
          headers.set('Content-Type', 'text/html');
          return new Response(
            `<html><head><style data-emotion="acss a b">.acss-a{x:y}.acss-b{x:y}</style></head>` +
              `<body><p class="acss-a">${shell ? 'shell' : (page?.title ?? 'not found')} ${new URL(request.url).pathname}</p>` +
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
            if (request.headers.get('x-shopana-static-render') === 'shell') {
              return { title: 'shell' };
            }
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

  it('writes the pages of every language, their data, shells, 404 and the manifest', async () => {
    const report = await build();
    expect(report.failed).toEqual([]);
    expect(report.pages).toBe(6);

    const page = await read('uk/products/socks/index.html');
    expect(page).toContain('Socks /uk/products/socks');
    // The unused emotion rule is gone; the static facts are in the head.
    expect(page).toContain('<style data-emotion="acss a">.acss-a{x:y}</style>');
    expect(page).toContain(
      '<script>window.__shopanaStatic={"buildId":"build-1","renderedAt":"2026-11-06T10:00:00.000Z","locale":"uk","path":"/uk/products/socks","validUntil":"2099-01-01T00:00:00.000Z","dataPageTypes":["home","product"]}</script></head>'
    );
    expect(
      JSON.parse(await read('__static/data/uk/products/socks.json'))
    ).toMatchObject({
      'Product:1': { title: 'Socks' },
    });
    expect(await read('cart/index.html')).toContain('shell /cart');
    expect(await read('uk/cart/index.html')).toContain('shell /uk/cart');
    expect(await read('__shell/products.html')).toContain(
      'shell /products/__shell'
    );
    expect(await read('404.html')).toContain('not found /__static/not-found');
    expect(await read('robots.txt')).toBe('User-agent: *\n');
    expect(await read('assets/app-1.js')).toBe('js');

    const manifest = JSON.parse(
      await read('__static/manifest.json')
    ) as StaticManifest;
    expect(manifest.locales).toEqual(['en', 'uk']);
    expect(manifest.dataPageTypes).toEqual(['home', 'product']);
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
      data: '__static/data/products/socks.json',
      entities: ['Product:1'],
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
    await expect(read('__static/data/products/hats.json')).rejects.toThrow();
    await expect(read('products/orphan/index.html')).rejects.toThrow();
    expect(await read('products/orphan.html')).toBe('x');
    expect(later.removed).toBe(5);
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
    expect(
      later.manifest.files['__static/data/products/socks.json']
    ).toBeDefined();
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

  it('removes the page of a product that answers 404 at once', async () => {
    await build();
    unpublished.add('hats');
    const later = await build(new Date('2026-11-07T10:00:00Z'));
    expect(later.manifest.files['products/hats/index.html']).toBeUndefined();
    expect(
      later.manifest.retired?.['products/hats/index.html']
    ).toBeUndefined();
    await expect(read('products/hats/index.html')).rejects.toThrow();
    await expect(read('__static/data/products/hats.json')).rejects.toThrow();
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
