import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  contentHash,
  createFsStore,
  quoteEtag,
  StaticWriteConflict,
} from './store';

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), 'storefront-store-'));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('the directory store', () => {
  it('writes over the version it read only', async () => {
    const store = createFsStore(dir);
    await store.write('__static/manifest.json', 'one', 'application/json', {
      ifNoneMatch: '*',
    });
    await expect(
      store.write('__static/manifest.json', 'two', 'application/json', {
        ifNoneMatch: '*',
      })
    ).rejects.toBeInstanceOf(StaticWriteConflict);
    const read = await store.read('__static/manifest.json');
    if (read.status !== 'found') throw new Error('no manifest');
    await store.write('__static/manifest.json', 'two', 'application/json', {
      ifMatch: read.etag,
    });
    await expect(
      store.write('__static/manifest.json', 'three', 'application/json', {
        ifMatch: read.etag,
      })
    ).rejects.toBeInstanceOf(StaticWriteConflict);
    expect(await store.list()).toEqual(['__static/manifest.json']);
  });

  it('knows the ETag of a file per version of it', async () => {
    const store = createFsStore(dir);
    await store.write('index.html', '<p>one</p>', 'text/html');
    const first = await store.read('index.html');
    expect(first).toMatchObject({
      status: 'found',
      etag: quoteEtag(contentHash('<p>one</p>')),
    });
    const etag = first.status === 'found' ? first.etag : '';
    expect(await store.read('index.html', { ifNoneMatch: etag })).toEqual({
      status: 'not-modified',
      etag,
    });
    // Another content at the same key: a new version, a new ETag.
    await writeFile(path.join(dir, 'index.html'), '<p>two</p>');
    expect(await store.read('index.html', { ifNoneMatch: etag })).toMatchObject(
      {
        status: 'found',
        etag: quoteEtag(contentHash('<p>two</p>')),
      }
    );
  });
});
