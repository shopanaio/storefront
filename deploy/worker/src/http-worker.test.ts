import { describe, expect, it } from 'vitest';
import { httpBucket } from './http-worker';
import { handleRequest, type EdgeCache } from './worker';

describe('public S3 CDN', () => {
  it('reads public objects without forwarding visitor credentials; distinguishes absence and outage', async () => {
    const bucket = httpBucket('https://storage.test/theme-static', (async (
      input,
      init
    ) => {
      expect(init?.cache).toBe('no-store');
      expect(String(input)).toBe(
        'https://storage.test/theme-static/site/index.html'
      );
      expect(new Headers(init?.headers).get('cookie')).toBeNull();
      expect(new Headers(init?.headers).get('authorization')).toBeNull();
      return new Response('html', { headers: { 'Content-Type': 'text/html' } });
    }) as typeof fetch);
    expect(
      await new Response((await bucket.get('site/index.html'))!.body).text()
    ).toBe('html');
    expect(
      await httpBucket(
        'https://storage.test/',
        (async () => new Response(null, { status: 404 })) as typeof fetch
      ).get('x')
    ).toBeNull();
    await expect(
      httpBucket(
        'https://storage.test/',
        (async () => new Response(null, { status: 503 })) as typeof fetch
      ).get('x')
    ).rejects.toThrow('503');
  });

  it('never reads or caches personal, localized personal or filtered pages', async () => {
    for (const path of [
      '/cart',
      '/en/cart',
      '/uk/checkout/a',
      '/account',
      '/auth',
      '/?sort=NEWEST',
    ]) {
      let originCalls = 0;
      const response = await handleRequest(
        new Request(`https://pet.test${path}`),
        {
          SITE: {
            get: async () => {
              throw new Error('must bypass S3');
            },
          },
        },
        { waitUntil: () => {} },
        {
          cache: {
            match: async () => {
              throw new Error('must bypass CDN');
            },
            put: async () => {},
          },
          fetch: (async () => {
            originCalls++;
            return new Response('SSR');
          }) as typeof fetch,
        }
      );
      expect(await response.text()).toBe('SSR');
      expect(originCalls).toBe(1);
    }
  });

  it('stores guest HTML, then hits the CDN; keeps stage headers and its bounded TTL', async () => {
    let saved: Response | undefined;
    let reads = 0;
    const cache: EdgeCache = {
      match: async () => saved?.clone(),
      put: async (_, r) => {
        saved = r;
      },
    };
    const pending: Promise<unknown>[] = [];
    const env = {
      SITE: {
        get: async () => {
          reads++;
          return { body: new Response('HTML').body, httpEtag: '' };
        },
      },
      PAGE_TTL: '60',
      NOINDEX: 'true',
    };
    const request = new Request('https://pet.test/');
    const first = await handleRequest(
      request,
      env,
      {
        waitUntil: (p) => {
          pending.push(p);
        },
      },
      { cache }
    );
    expect(first.headers.get('x-shopana-cdn')).toBe('MISS');
    expect(first.headers.get('cache-control')).toContain('s-maxage=60');
    expect(first.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    await Promise.all(pending);
    saved!.headers.set('Cache-Control', 'public, max-age=14400, s-maxage=60');
    const second = await handleRequest(
      request,
      env,
      { waitUntil: () => {} },
      { cache }
    );
    expect(second.headers.get('x-shopana-cdn')).toBe('HIT');
    expect(second.headers.get('cache-control')).toBe(
      'public, max-age=0, s-maxage=60'
    );
    expect(await second.text()).toBe('HTML');
    expect(reads).toBe(1);
  });
});
