import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import type { Server } from 'node:http';
import type { RequestHandler } from 'express';
import type { ServerBuild } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { StaticServerIndex } from '@shopana/storefront-sdk/static';
import { createCachedStore } from './memory-cache';
import { createStorefrontServer, resolveServerStore } from './server';
import {
  contentHash,
  createFsStore,
  quoteEtag,
  type StaticRead,
  type StaticStore,
} from './store';

let dir: string;
let server: Server | null = null;

const ssr = vi.fn<RequestHandler>((request, response) => {
  // The server render: a non-canonical address redirects, an unknown product is its 404, the
  // rest renders.
  if (request.path.startsWith('/en/')) {
    response.redirect(307, request.path.slice(3));
    return;
  }
  if (request.path.startsWith('/uk/products/made-up')) {
    response.status(404).type('html').send('<p>ssr 404</p>');
    return;
  }
  response
    .status(200)
    .set('Cache-Control', 'private, no-store')
    .type('html')
    .send(`<p>ssr ${request.method} ${request.originalUrl}</p>`);
});

const index: StaticServerIndex = {
  version: 1,
  buildId: 'b1',
  locales: ['en', 'uk'],
  statuses: { '404.html': 404 },
};

async function writeSite(files: Record<string, string>) {
  for (const [key, body] of Object.entries(files)) {
    const file = path.join(dir, key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, body);
  }
}

async function serve(
  options: Partial<Parameters<typeof createStorefrontServer>[0]> = {}
) {
  const app = await createStorefrontServer({
    runtimeDir: dir,
    build: {} as ServerBuild,
    render: ssr,
    store: createFsStore(path.join(dir, 'build/static')),
    env: { NEXT_PUBLIC_API_KEY: 'public', STOREFRONT_SESSION_SECRET: 'secret' },
    logger: { info: () => {}, warn: () => {} },
    ...options,
  });
  server = await new Promise<Server>((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  const { port } = server.address() as AddressInfo;
  return (pathname: string, init?: RequestInit) =>
    fetch(`http://127.0.0.1:${port}${pathname}`, {
      redirect: 'manual',
      ...init,
    });
}

beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), 'storefront-server-'));
  ssr.mockClear();
  await writeSite({
    'build/client/assets/new.js': 'new',
    'build/client/favicon.ico': 'icon',
    'build/static/__static/server.json': JSON.stringify(index),
    'build/static/index.html': '<p>home</p>',
    'build/static/uk/products/x/index.html': '<p>x</p>',
    'build/static/__static/data/uk/products/x.json': '{"ROOT_QUERY":{}}',
    'build/static/404.html': '<p>404</p>',
    'build/static/__shell/products.html': '<p>products shell</p>',
    'build/static/assets/old.js': 'old',
  });
});

afterEach(async () => {
  await new Promise((resolve) =>
    server ? server.close(resolve) : resolve(null)
  );
  server = null;
  await rm(dir, { recursive: true, force: true });
});

describe('the hybrid server', () => {
  it('answers a generated page from the static site, and 304 for its ETag', async () => {
    const get = await serve();
    // Campaign parameters render nothing: the address without them.
    const response = await get('/uk/products/x?utm_source=mail&gclid=1');
    expect(response.status).toBe(200);
    expect(response.headers.get('x-shopana-static')).toBe('hit');
    expect(response.headers.get('cache-control')).toBe(
      'public, max-age=0, must-revalidate'
    );
    const etag = quoteEtag(contentHash('<p>x</p>'));
    expect(response.headers.get('etag')).toBe(etag);
    expect(await response.text()).toBe('<p>x</p>');

    const again = await get('/uk/products/x', {
      headers: { 'If-None-Match': etag },
    });
    expect(again.status).toBe(304);
    expect(again.headers.get('x-shopana-static')).toBe('hit');
    expect(ssr).not.toHaveBeenCalled();
  });

  it('renders an address whose parameters may change the page', async () => {
    const get = await serve();
    for (const query of [
      'sort=price',
      'filter.color=red',
      'variant=xl&utm_source=mail',
    ]) {
      const response = await get(`/uk/products/x?${query}`);
      expect(response.headers.get('x-shopana-static')).toBe('miss');
      expect(await response.text()).toBe(
        `<p>ssr GET /uk/products/x?${query}</p>`
      );
    }
  });

  it('answers HEAD from the static site without a body', async () => {
    const get = await serve();
    const response = await get('/', { method: 'HEAD' });
    expect(response.status).toBe(200);
    expect(response.headers.get('content-length')).toBe('11');
    expect(await response.text()).toBe('');
  });

  it('renders a page without a file, and redirects a non-canonical address', async () => {
    const get = await serve();
    const miss = await get('/uk/products/y');
    expect(miss.status).toBe(200);
    expect(miss.headers.get('x-shopana-static')).toBe('miss');
    expect(miss.headers.get('cache-control')).toBe('private, no-store');
    expect(await miss.text()).toBe('<p>ssr GET /uk/products/y</p>');

    const redirect = await get('/en/products/x');
    expect(redirect.status).toBe(307);
    expect(redirect.headers.get('location')).toBe('/products/x');
  });

  it('leaves auth, data requests and other methods to the server', async () => {
    await writeSite({ 'build/static/auth/login/index.html': 'never' });
    const get = await serve();
    expect(await (await get('/auth/login')).text()).toBe(
      '<p>ssr GET /auth/login</p>'
    );
    expect(await (await get('/uk/products/x.data')).text()).toBe(
      '<p>ssr GET /uk/products/x.data</p>'
    );
    expect(await (await get('/uk/products/x', { method: 'POST' })).text()).toBe(
      '<p>ssr POST /uk/products/x</p>'
    );
  });

  it('answers page data from the store or 404, never rendered', async () => {
    const get = await serve();
    const found = await get('/__static/data/uk/products/x.json');
    expect(found.status).toBe(200);
    expect(await found.json()).toEqual({ ROOT_QUERY: {} });
    const etag = found.headers.get('etag') ?? '';
    const again = await get('/__static/data/uk/products/x.json', {
      headers: { 'If-None-Match': etag },
    });
    expect(again.status).toBe(304);
    expect(again.headers.get('cache-control')).toBe(
      'public, max-age=0, must-revalidate'
    );
    const missing = await get('/__static/data/uk/products/y.json');
    expect(missing.status).toBe(404);
    expect(ssr).not.toHaveBeenCalled();
  });

  it('serves the public settings of its environment', async () => {
    const get = await serve();
    const response = await get('/__env.js');
    expect(response.headers.get('cache-control')).toBe('no-cache');
    const body = await response.text();
    expect(body).toContain('"NEXT_PUBLIC_API_KEY":"public"');
    expect(body).not.toContain('secret');
    const etag = response.headers.get('etag');
    expect(etag).toBe(quoteEtag(contentHash(body)));
    const again = await get('/__env.js', {
      headers: { 'If-None-Match': etag ?? '' },
    });
    expect(again.status).toBe(304);
    expect(await again.text()).toBe('');
  });

  it('serves the assets of the build, and those of earlier builds from the store', async () => {
    const get = await serve();
    const current = await get('/assets/new.js');
    expect(current.headers.get('cache-control')).toContain('immutable');
    expect(await current.text()).toBe('new');
    const old = await get('/assets/old.js');
    expect(old.status).toBe(200);
    expect(old.headers.get('cache-control')).toContain('immutable');
    expect(await old.text()).toBe('old');
    expect((await get('/assets/none.js')).status).toBe(404);
    expect(await (await get('/favicon.ico')).text()).toBe('icon');
  });

  it('renders when the store fails, never a 5xx of its own', async () => {
    const failing: StaticStore = {
      ...createFsStore(path.join(dir, 'build/static')),
      read: async () => {
        throw new Error('bucket down');
      },
    };
    const get = await serve({ store: failing });
    const response = await get('/uk/products/x');
    expect(response.status).toBe(200);
    expect(response.headers.get('x-shopana-static')).toBe('miss');
    expect(await response.text()).toBe('<p>ssr GET /uk/products/x</p>');
  });

  it('sees a new version of a bucket page after the TTL', async () => {
    let version = 1;
    const reads: Array<string | undefined> = [];
    const bucket: StaticStore = {
      ...createFsStore(path.join(dir, 'build/static')),
      kind: 's3',
      async read(key, { ifNoneMatch } = {}): Promise<StaticRead> {
        if (key !== 'index.html') return { status: 'missing' };
        reads.push(ifNoneMatch);
        const etag = `"v${version}"`;
        if (ifNoneMatch === etag) return { status: 'not-modified', etag };
        return {
          status: 'found',
          body: Buffer.from(`v${version}`),
          etag,
          contentType: 'text/html',
        };
      },
    };
    let now = 0;
    const get = await serve({
      store: createCachedStore(bucket, {
        ttlMs: 10_000,
        maxBytes: 1_000_000,
        now: () => now,
      }),
    });
    expect(await (await get('/')).text()).toBe('v1');
    version = 2;
    expect(await (await get('/')).text()).toBe('v1');
    now = 10_000;
    expect(await (await get('/')).text()).toBe('v2');
    expect(reads).toEqual([undefined, '"v1"']);
  });

  it('tells the coordinator every 30 s of the pages served and the generated ones missed', async () => {
    vi.useFakeTimers({ toFake: ['setInterval'] });
    try {
      const fetchCoordinator = vi.fn(
        async () => new Response(null, { status: 204 })
      );
      const get = await serve({
        env: {
          STOREFRONT_STATIC_COORDINATOR_URL: 'http://theme-static:3100',
          STOREFRONT_STATIC_COORDINATOR_TOKEN: 'internal',
        },
        fetch: fetchCoordinator as unknown as typeof fetch,
      });
      await get('/uk/products/x');
      await get('/uk/products/x');
      await get('/uk/products/new');
      await get('/uk/products/new');
      // A made-up address the server answers with its 404: never a page to add.
      await get('/uk/products/made-up');
      await get(`/uk/products/${'x'.repeat(300)}`);
      await get('/cart');
      expect(fetchCoordinator).not.toHaveBeenCalled();
      vi.advanceTimersByTime(30_000);
      expect(fetchCoordinator).toHaveBeenCalledTimes(1);
      const [url, init] = fetchCoordinator.mock.calls[0] as unknown as [
        URL,
        RequestInit,
      ];
      expect(String(url)).toBe('http://theme-static:3100/__builder/api/hits');
      expect((init.headers as Record<string, string>).Authorization).toBe(
        'Bearer internal'
      );
      expect(JSON.parse(String(init.body))).toEqual({
        hits: { 'uk/products/x/index.html': 2 },
        misses: ['uk/products/new/index.html'],
      });
      vi.advanceTimersByTime(30_000);
      expect(fetchCoordinator).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders a request from outside that carries the builder header as any other', async () => {
    const get = await serve();
    const response = await get('/uk/products/none', {
      headers: {
        'x-shopana-static-render': 'shell',
        'x-shopana-static-render-key': 'guessed',
      },
    });
    expect(response.headers.get('x-shopana-static')).toBe('miss');
    const [request] = ssr.mock.calls[0];
    expect(request.headers['x-shopana-static-render']).toBeUndefined();
    expect(request.headers['x-shopana-static-render-key']).toBeUndefined();
  });

  it('serves no static page at an address with an empty segment', async () => {
    const get = await serve();
    const response = await get('/uk//products/x');
    expect(response.headers.get('x-shopana-static')).toBeNull();
    expect(ssr).toHaveBeenCalledTimes(1);
  });

  it('answers the family shell or 404.html without a server render', async () => {
    const get = await serve({ staticOnly: true });
    const shell = await get('/uk/products/y');
    expect(shell.status).toBe(200);
    expect(await shell.text()).toBe('<p>products shell</p>');
    const unknown = await get('/nothing/here');
    expect(unknown.status).toBe(404);
    expect(await unknown.text()).toBe('<p>404</p>');
    const notFoundFile = await get('/404.html');
    expect(notFoundFile.status).toBe(404);
    expect(ssr).not.toHaveBeenCalled();
  });
});

describe('the store of the server', () => {
  it('takes build/static when it has an index, and nothing otherwise', async () => {
    expect((await resolveServerStore(dir, {}))?.url).toBe(
      `fs:${path.join(dir, 'build/static')}`
    );
    await rm(path.join(dir, 'build/static/__static/server.json'));
    expect(await resolveServerStore(dir, {})).toBeNull();
  });

  it('takes STOREFRONT_STATIC_STORE first', async () => {
    const store = await resolveServerStore(dir, {
      STOREFRONT_STATIC_STORE: 's3://site/stage',
      STOREFRONT_STATIC_S3_ENDPOINT: 'https://r2.example',
      STOREFRONT_STATIC_S3_ACCESS_KEY_ID: 'k',
      STOREFRONT_STATIC_S3_SECRET_ACCESS_KEY: 's',
    });
    expect(store?.url).toBe('s3://site/stage');
    expect(
      (
        await resolveServerStore(dir, {
          STOREFRONT_STATIC_STORE: 'fs:elsewhere',
        })
      )?.url
    ).toBe(`fs:${path.join(dir, 'elsewhere')}`);
  });
});
