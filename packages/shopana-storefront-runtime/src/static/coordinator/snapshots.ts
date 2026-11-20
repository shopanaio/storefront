/**
 * Snapshots of the coordinator's index in the bucket (`__builder/index/<date>.sqlite.gz`, the
 * last 7): taken daily and after every full build, restored when the volume is empty at start.
 * `__builder/` is no file of the site (`isStaticSiteKey`): a full build never deletes it.
 */
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';
import type { DatabaseSync } from 'node:sqlite';
import type { StaticStore } from '../store';

export const SNAPSHOT_PREFIX = '__builder/index/';

/** Snapshots kept. */
const KEEP = 7;

/** Writes a snapshot of the database; resolves with its key. */
export async function takeSnapshot(
  db: DatabaseSync,
  store: StaticStore,
  now: Date = new Date()
): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'static-index-'));
  try {
    const file = path.join(dir, 'index.sqlite');
    db.exec(`VACUUM INTO '${file.replace(/'/g, "''")}'`);
    const key = `${SNAPSHOT_PREFIX}${now.toISOString().slice(0, 10)}.sqlite.gz`;
    await store.write(key, gzipSync(await readFile(file)), 'application/gzip');
    const keys = (await store.list(SNAPSHOT_PREFIX)).sort().reverse();
    for (const old of keys.slice(KEEP)) await store.remove(old);
    return key;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** Writes the latest snapshot to `file`; resolves with its key, or null without one. */
export async function restoreSnapshot(
  store: StaticStore,
  file: string
): Promise<string | null> {
  const keys = (await store.list(SNAPSHOT_PREFIX)).sort().reverse();
  for (const key of keys) {
    const read = await store.read(key);
    if (read.status !== 'found') continue;
    await writeFile(file, gunzipSync(read.body));
    return key;
  }
  return null;
}
