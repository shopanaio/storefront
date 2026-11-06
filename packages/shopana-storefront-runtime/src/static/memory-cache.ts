/**
 * The memory of a server reading a bucket: the objects it answered with, by key, least
 * recently used out first within a byte budget. An entry is trusted for `ttlMs`, then checked
 * again with a conditional request (`If-None-Match`), which the bucket answers with `304` and
 * no body while the object is the same. A missing object is remembered as long. So a page
 * published to the bucket shows on every replica within the TTL, with no purge. A bucket that
 * fails while an entry is due keeps the entry for another TTL: a known page stays served and
 * the bucket is not asked again on every request.
 */
import {
  etagMatches,
  type StaticObject,
  type StaticRead,
  type StaticStore,
} from './store';

interface Entry {
  object: StaticObject | null;
  checkedAt: number;
  size: number;
}

export interface CachedStoreOptions {
  /** How long an answer is trusted before it is checked again (`STOREFRONT_STATIC_CACHE_TTL`). */
  ttlMs: number;
  /** The bytes of bodies kept at most. */
  maxBytes: number;
  now?: () => number;
}

/** Bytes an entry without a body counts: its key and its bookkeeping. */
const ENTRY_OVERHEAD = 256;

export function createCachedStore(
  store: StaticStore,
  { ttlMs, maxBytes, now = Date.now }: CachedStoreOptions
): StaticStore {
  // A Map keeps insertion order: deleting and setting again moves a key to the end.
  const entries = new Map<string, Entry>();
  const pending = new Map<string, Promise<Entry>>();
  let bytes = 0;

  const remember = (key: string, entry: Entry) => {
    const previous = entries.get(key);
    if (previous) bytes -= previous.size;
    entries.delete(key);
    if (entry.size > maxBytes) return;
    entries.set(key, entry);
    bytes += entry.size;
    for (const [oldKey, old] of entries) {
      if (bytes <= maxBytes) break;
      entries.delete(oldKey);
      bytes -= old.size;
    }
  };

  const refresh = async (key: string, cached: Entry | undefined) => {
    let read: StaticRead;
    try {
      read = await store.read(
        key,
        cached?.object ? { ifNoneMatch: cached.object.etag } : {}
      );
    } catch (error) {
      if (!cached) throw error;
      const kept = { ...cached, checkedAt: now() };
      remember(key, kept);
      return kept;
    }
    const checkedAt = now();
    let entry: Entry;
    if (read.status === 'not-modified' && cached?.object) {
      entry = { ...cached, checkedAt };
    } else if (read.status === 'found') {
      const { body, etag, contentType } = read;
      entry = {
        object: { body, etag, contentType },
        checkedAt,
        size: body.length + ENTRY_OVERHEAD,
      };
    } else {
      entry = { object: null, checkedAt, size: ENTRY_OVERHEAD };
    }
    remember(key, entry);
    return entry;
  };

  const lookup = (key: string): Promise<Entry> => {
    const cached = entries.get(key);
    if (cached && now() - cached.checkedAt < ttlMs) {
      // Recently used: to the end of the order.
      entries.delete(key);
      entries.set(key, cached);
      return Promise.resolve(cached);
    }
    let request = pending.get(key);
    if (!request) {
      request = refresh(key, cached).finally(() => pending.delete(key));
      pending.set(key, request);
    }
    return request;
  };

  return {
    ...store,
    url: store.url,
    kind: store.kind,
    async read(key, { ifNoneMatch } = {}): Promise<StaticRead> {
      const { object } = await lookup(key);
      if (!object) return { status: 'missing' };
      if (etagMatches(ifNoneMatch, object.etag)) {
        return { status: 'not-modified', etag: object.etag };
      }
      return { status: 'found', ...object };
    },
  };
}
