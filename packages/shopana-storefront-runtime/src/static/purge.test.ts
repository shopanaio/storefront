import { describe, expect, it } from 'vitest';
import {
  createCloudflarePurger,
  PurgeRateLimited,
  purgerFromEnv,
} from './purge';

describe('the purge of CDN tags', () => {
  it('purges 100 tags a request with the token', async () => {
    const bodies: Array<{ url: string; tags: string[]; auth: string | null }> =
      [];
    const purger = createCloudflarePurger({
      zoneId: 'zone',
      token: 'secret',
      fetch: async (url, init) => {
        bodies.push({
          url: String(url),
          tags: JSON.parse(String(init?.body)).tags,
          auth: new Headers(init?.headers).get('authorization'),
        });
        return Response.json({ success: true });
      },
    });
    const tags = Array.from({ length: 150 }, (_, index) => `pg:${index}`);
    await purger.purge([...tags, 'pg:0']);
    expect(bodies.map((body) => body.tags.length)).toEqual([100, 50]);
    expect(bodies[0].url).toBe(
      'https://api.cloudflare.com/client/v4/zones/zone/purge_cache'
    );
    expect(bodies[0].auth).toBe('Bearer secret');
  });

  it('tells a rate limit apart', async () => {
    const purger = createCloudflarePurger({
      zoneId: 'zone',
      token: 'secret',
      fetch: async () =>
        new Response('', { status: 429, headers: { 'retry-after': '7' } }),
    });
    await expect(purger.purge(['a'])).rejects.toEqual(
      new PurgeRateLimited(7000)
    );
  });

  it('is none without a token', () => {
    expect(purgerFromEnv({ CLOUDFLARE_ZONE_ID: 'z' })).toBeNull();
  });
});
