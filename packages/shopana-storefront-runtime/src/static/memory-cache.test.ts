import { describe, expect, it, vi } from 'vitest';
import { createCachedStore } from './memory-cache';
import type { StaticRead, StaticStore } from './store';

function fakeStore(objects: Map<string, { body: string; etag: string }>) {
  const reads: Array<{ key: string; ifNoneMatch?: string }> = [];
  const store: StaticStore = {
    url: 's3://site',
    kind: 's3',
    async read(key, { ifNoneMatch } = {}): Promise<StaticRead> {
      reads.push({ key, ifNoneMatch });
      const object = objects.get(key);
      if (!object) return { status: 'missing' };
      if (ifNoneMatch === object.etag) {
        return { status: 'not-modified', etag: object.etag };
      }
      return {
        status: 'found',
        body: Buffer.from(object.body),
        etag: object.etag,
        contentType: 'text/html',
      };
    },
    write: vi.fn(),
    remove: vi.fn(),
    list: vi.fn(),
  };
  return { store, reads };
}

describe('the memory of a bucket', () => {
  it('trusts an answer for the TTL, then checks it with If-None-Match', async () => {
    const objects = new Map([['a', { body: 'one', etag: '"1"' }]]);
    const { store, reads } = fakeStore(objects);
    let now = 0;
    const cached = createCachedStore(store, {
      ttlMs: 10_000,
      maxBytes: 1_000_000,
      now: () => now,
    });
    expect(await cached.read('a')).toMatchObject({
      status: 'found',
      etag: '"1"',
    });
    expect(await cached.read('a')).toMatchObject({ status: 'found' });
    expect(reads).toHaveLength(1);

    now = 10_000;
    await cached.read('a');
    expect(reads[1]).toEqual({ key: 'a', ifNoneMatch: '"1"' });

    objects.set('a', { body: 'two', etag: '"2"' });
    now = 20_000;
    const read = await cached.read('a');
    expect(read.status === 'found' && read.body.toString()).toBe('two');
  });

  it('remembers a missing object as long, and answers 304 for its own ETag', async () => {
    const objects = new Map<string, { body: string; etag: string }>();
    const { store, reads } = fakeStore(objects);
    const cached = createCachedStore(store, {
      ttlMs: 10_000,
      maxBytes: 1_000_000,
      now: () => 0,
    });
    expect(await cached.read('b')).toEqual({ status: 'missing' });
    objects.set('b', { body: 'x', etag: '"x"' });
    expect(await cached.read('b')).toEqual({ status: 'missing' });
    expect(reads).toHaveLength(1);
  });

  it('drops the least recently used objects beyond its budget', async () => {
    const objects = new Map([
      ['a', { body: 'a'.repeat(400), etag: '"a"' }],
      ['b', { body: 'b'.repeat(400), etag: '"b"' }],
      ['c', { body: 'c'.repeat(400), etag: '"c"' }],
    ]);
    const { store, reads } = fakeStore(objects);
    const cached = createCachedStore(store, {
      ttlMs: 60_000,
      maxBytes: 1_400,
      now: () => 0,
    });
    await cached.read('a');
    await cached.read('b');
    await cached.read('a');
    await cached.read('c');
    reads.length = 0;
    await cached.read('a');
    await cached.read('b');
    expect(reads.map((read) => read.key)).toEqual(['b']);
  });

  it('keeps serving a known object while the bucket fails, and asks again after the TTL', async () => {
    const objects = new Map([['a', { body: 'one', etag: '"1"' }]]);
    const { store, reads } = fakeStore(objects);
    let now = 0;
    const cached = createCachedStore(store, {
      ttlMs: 10_000,
      maxBytes: 1_000_000,
      now: () => now,
    });
    await cached.read('a');
    const failing = vi.fn(async () => {
      throw new Error('bucket down');
    });
    store.read = failing;
    now = 10_000;
    expect((await cached.read('a')).status).toBe('found');
    expect(await cached.read('a', { ifNoneMatch: 'W/"1"' })).toEqual({
      status: 'not-modified',
      etag: '"1"',
    });
    expect(failing).toHaveBeenCalledTimes(1);
    await expect(cached.read('b')).rejects.toThrow('bucket down');
    expect(reads).toHaveLength(1);
  });
});
