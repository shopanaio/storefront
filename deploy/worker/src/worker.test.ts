import { beforeEach, describe, expect, it } from 'vitest';
import {
  handleRequest,
  PAGE_CACHE_CONTROL,
  resetWorkerState,
  type EdgeCache,
  type SiteObject,
  type WorkerEnv,
} from './worker';

/** A bucket of the given objects (`key` → body, tags). */
function bucket(
  objects: Record<string, { body: string; tags?: string; type?: string }>
) {
  const reads: string[] = [];
  return {
    reads,
    SITE: {
      async get(key: string): Promise<SiteObject | null> {
        reads.push(key);
        const object = objects[key];
        if (!object) return null;
        return {
          body: new Response(object.body).body,
          httpEtag: `"${key.length}"`,
          httpMetadata: {
            contentType: object.type ?? 'text/html; charset=utf-8',
          },
          customMetadata: object.tags ? { 'cache-tag': object.tags } : {},
          text: async () => object.body,
        };
      },
    },
  };
}

function edgeCache(): EdgeCache & { entries: Map<string, Response> } {
  const entries = new Map<string, Response>();
  return {
    entries,
    async match(request) {
      return entries.get(request.url)?.clone();
    },
    async put(request, response) {
      entries.set(request.url, response);
    },
  };
}

function context() {
  const pending: Array<Promise<unknown>> = [];
  return {
    pending,
    ctx: {
      waitUntil: (promise: Promise<unknown>) => void pending.push(promise),
    },
  };
}

const site = {
  'site/products/a/index.html': {
    body: '<p>A</p>',
    tags: 'pg:0123456789abcdef,build:b1',
  },
  'site/__static/data/products/a.json': {
    body: '{}',
    type: 'application/json',
    tags: 'pg:0123456789abcdef,build:b1',
  },
  'site/__static/server.json': {
    body: '{"locales":["en","uk"]}',
    type: 'application/json',
  },
  'site/__shell/products.html': { body: '<p>shell</p>' },
  'site/404.html': { body: '<p>404</p>' },
  'site/public/favicon.ico': { body: 'icon', type: 'image/x-icon' },
};

beforeEach(() => resetWorkerState());

describe('the CDN worker', () => {
  it('answers a page from the bucket, caches it with its tags, then from the cache', async () => {
    const { SITE, reads } = bucket(site);
    const cache = edgeCache();
    const reports: Array<{ url: string; body: string; auth: string | null }> =
      [];
    const fetcher = (async (input: RequestInfo | URL, init?: RequestInit) => {
      reports.push({
        url: String(input),
        body: String(init?.body),
        auth: new Headers(init?.headers).get('authorization'),
      });
      return new Response(null, { status: 204 });
    }) as typeof fetch;
    const env: WorkerEnv = {
      SITE,
      SITE_PREFIX: 'site',
      COORDINATOR_URL: 'https://shop.test',
      COORDINATOR_TOKEN: 'internal',
    };
    const { ctx, pending } = context();
    const first = await handleRequest(
      new Request('https://shop.test/products/a?utm_source=x'),
      env,
      ctx,
      { cache, fetch: fetcher }
    );
    await Promise.all(pending);
    expect(first.status).toBe(200);
    expect(await first.text()).toBe('<p>A</p>');
    expect(first.headers.get('Cache-Tag')).toBeNull();
    expect(first.headers.get('Cache-Control')).toBe(PAGE_CACHE_CONTROL);
    const stored = cache.entries.get('https://shop.test/products/a');
    expect(stored?.headers.get('Cache-Tag')).toBe(
      'pg:0123456789abcdef,build:b1'
    );
    expect(reports).toEqual([
      {
        url: 'https://shop.test/__builder/api/hits',
        body: '{"hits":{"products/a/index.html":1}}',
        auth: 'Bearer internal',
      },
    ]);

    const second = await handleRequest(
      new Request('https://shop.test/products/a'),
      env,
      ctx,
      {
        cache,
        fetch: fetcher,
      }
    );
    expect(await second.text()).toBe('<p>A</p>');
    expect(reads.filter((key) => key.endsWith('index.html'))).toHaveLength(1);
    expect(reports).toHaveLength(1);

    const etag = second.headers.get('ETag')!;
    const revalidated = await handleRequest(
      new Request('https://shop.test/products/a', {
        headers: { 'If-None-Match': etag },
      }),
      env,
      ctx,
      { cache, fetch: fetcher }
    );
    expect(revalidated.status).toBe(304);
  });

  it('answers the data of a page and the files of public/', async () => {
    const { SITE } = bucket(site);
    const { ctx } = context();
    const env = { SITE, SITE_PREFIX: 'site' };
    const data = await handleRequest(
      new Request('https://shop.test/__static/data/products/a.json'),
      env,
      ctx,
      { cache: edgeCache() }
    );
    expect(data.headers.get('Content-Type')).toBe('application/json');
    const missing = await handleRequest(
      new Request('https://shop.test/__static/data/products/b.json'),
      env,
      ctx,
      { cache: edgeCache() }
    );
    expect(missing.status).toBe(404);
    const icon = await handleRequest(
      new Request('https://shop.test/favicon.ico'),
      env,
      ctx,
      { cache: edgeCache() }
    );
    expect(await icon.text()).toBe('icon');
  });

  it('sends the node what has no file, a changing query, auth and other methods', async () => {
    const { SITE } = bucket(site);
    const seen: Array<{ url: string; cookie: string | null; method: string }> =
      [];
    const fetcher = (async (input: RequestInfo | URL) => {
      const request = input as Request;
      seen.push({
        url: request.url,
        cookie: request.headers.get('cookie'),
        method: request.method,
      });
      return new Response('node', {
        status: 200,
        headers: { 'Set-Cookie': 'a=1' },
      });
    }) as typeof fetch;
    const { ctx } = context();
    const env = { SITE, SITE_PREFIX: 'site' };
    const cache = edgeCache();
    for (const request of [
      new Request('https://shop.test/products/new'),
      new Request('https://shop.test/products/a?sort=price'),
      new Request('https://shop.test/auth/login', {
        headers: { cookie: 's=1' },
      }),
      new Request('https://shop.test/__env.js'),
      new Request('https://shop.test/products/a', {
        method: 'POST',
        body: 'x',
      }),
    ]) {
      const response = await handleRequest(request, env, ctx, {
        cache,
        fetch: fetcher,
      });
      expect(await response.text()).toBe('node');
    }
    expect(
      seen.map((call) => [new URL(call.url).pathname, call.method])
    ).toEqual([
      ['/products/new', 'GET'],
      ['/products/a', 'GET'],
      ['/auth/login', 'GET'],
      ['/__env.js', 'GET'],
      ['/products/a', 'POST'],
    ]);
    expect(seen[2].cookie).toBe('s=1');
    expect(cache.entries.size).toBe(0);
  });

  it('degrades to the shell of the family, else the 404 page, when the node is down', async () => {
    const { SITE } = bucket(site);
    const { ctx } = context();
    const env = { SITE, SITE_PREFIX: 'site' };
    const down = (async () =>
      new Response('', { status: 530 })) as typeof fetch;
    const shell = await handleRequest(
      new Request('https://shop.test/uk/products/new'),
      env,
      ctx,
      { cache: edgeCache(), fetch: down }
    );
    expect([shell.status, await shell.text()]).toEqual([200, '<p>shell</p>']);
    const broken = (async () => {
      throw new Error('tunnel');
    }) as typeof fetch;
    const notFound = await handleRequest(
      new Request('https://shop.test/unknown/page'),
      env,
      ctx,
      { cache: edgeCache(), fetch: broken }
    );
    expect([notFound.status, await notFound.text()]).toEqual([
      404,
      '<p>404</p>',
    ]);
  });
});
