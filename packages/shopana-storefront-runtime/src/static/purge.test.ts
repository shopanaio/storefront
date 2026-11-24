import { describe, expect, it } from 'vitest';
import {
  createCloudflarePurger,
  PurgeRateLimited,
  purgeBudget,
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

  it('keeps to half of the account limit of the plan', async () => {
    let time = 0;
    let requests = 0;
    const waits: number[] = [];
    const purger = createCloudflarePurger({
      zoneId: 'zone',
      token: 'secret',
      plan: 'free',
      now: () => time,
      sleep: async (ms) => {
        waits.push(ms);
        time += ms;
      },
      fetch: async () => {
        requests++;
        return Response.json({ success: true });
      },
    });
    await purger.purge(['a']);
    await purger.purge(['b']);
    // Free: 5 a minute, half of it — 2.5 a minute: the third request waits 24 s for a token.
    await purger.purge(['c']);
    expect(requests).toBe(3);
    expect(waits).toEqual([24_000]);
  });

  it('gives up past the longest wait and drains on a rate limit', async () => {
    let time = 0;
    let requests = 0;
    const purger = createCloudflarePurger({
      zoneId: 'zone',
      token: 'secret',
      plan: 'free',
      now: () => time,
      sleep: async (ms) => {
        time += ms;
      },
      fetch: async () => {
        requests++;
        return Response.json(
          { success: false, errors: [{ code: 1134, message: 'rate limited' }] },
          { status: 400 }
        );
      },
    });
    await expect(purger.purge(['a'])).rejects.toBeInstanceOf(PurgeRateLimited);
    // The bucket is empty: the next purge waits 24 s for a token, within the longest wait.
    await expect(purger.purge(['b'])).rejects.toBeInstanceOf(PurgeRateLimited);
    expect(requests).toBe(2);
    expect(time).toBe(24_000);
  });

  it('a bucket of a plan refills at half of its rate', () => {
    let time = 0;
    const pro = purgeBudget('pro', 0.5, () => time);
    expect([pro.take(), pro.take(), pro.take()]).toEqual([0, 0, 400]);
    time = 400;
    expect(pro.take()).toBe(0);
  });

  it('rejects an unknown plan', () => {
    expect(() =>
      purgerFromEnv({
        CLOUDFLARE_PURGE_TOKEN: 't',
        CLOUDFLARE_ZONE_ID: 'z',
        CLOUDFLARE_PURGE_PLAN: 'gold',
      })
    ).toThrow('CLOUDFLARE_PURGE_PLAN');
  });

  it('is none without a token', () => {
    expect(purgerFromEnv({ CLOUDFLARE_ZONE_ID: 'z' })).toBeNull();
  });
});
