/**
 * Where the static site lives: a directory (`fs:<dir>`, the build of an image, local runs) or
 * a bucket of the S3 API (`s3://<bucket>/<prefix>`, Cloudflare R2), with the same keys
 * (`keys.ts`). The builder writes, the hybrid server reads.
 */
import { createHash, randomBytes } from 'node:crypto';
import {
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { S3Client } from './s3';

export interface StaticObject {
  body: Buffer;
  /** Quoted, as in an `ETag` header. */
  etag: string;
  contentType: string;
}

export type StaticRead =
  | ({ status: 'found' } & StaticObject)
  /** The object is the one of `ifNoneMatch`. */
  | { status: 'not-modified'; etag: string }
  | { status: 'missing' };

/** A write that takes place only over the object a writer read (the manifest). */
export interface StaticWriteOptions {
  /** Only over the object of this ETag. */
  ifMatch?: string;
  /** `*`: only where there is no object yet. */
  ifNoneMatch?: '*';
}

/** The object changed since the writer read it: another writer was first. */
export class StaticWriteConflict extends Error {
  constructor(key: string) {
    super(`${key} changed since it was read`);
    this.name = 'StaticWriteConflict';
  }
}

export interface StaticStore {
  /** `fs:<dir>` or `s3://<bucket>/<prefix>`. */
  readonly url: string;
  readonly kind: 'fs' | 's3';
  read(key: string, options?: { ifNoneMatch?: string }): Promise<StaticRead>;
  /** Throws `StaticWriteConflict` when a condition of `options` does not hold. */
  write(
    key: string,
    body: Buffer | string,
    contentType: string,
    options?: StaticWriteOptions
  ): Promise<void>;
  remove(key: string): Promise<void>;
  /** Every key under `prefix`. */
  list(prefix?: string): Promise<string[]>;
}

/** Content types of the files of a static site, by extension. */
const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

export function contentTypeOf(key: string): string {
  return (
    CONTENT_TYPES[path.extname(key).toLowerCase()] ?? 'application/octet-stream'
  );
}

/** The hash of a content: the builder's manifest and the `fs` store's ETag. */
export function contentHash(body: Buffer | string): string {
  return createHash('sha256').update(body).digest('hex').slice(0, 32);
}

export const quoteEtag = (hash: string) => `"${hash}"`;

/**
 * Whether an `If-None-Match` header names an ETag: one of its list, weak or strong (a proxy
 * that compresses makes them weak), or `*`.
 */
export function etagMatches(
  ifNoneMatch: string | undefined,
  etag: string
): boolean {
  if (!ifNoneMatch || !etag) return false;
  const strong = etag.replace(/^W\//, '');
  return ifNoneMatch
    .split(',')
    .map((tag) => tag.trim())
    .some((tag) => tag === '*' || tag.replace(/^W\//, '') === strong);
}

/** A key that cannot leave the store's root. */
function assertKey(key: string): void {
  if (
    !key ||
    key.startsWith('/') ||
    key.split('/').some((part) => part === '' || part === '.' || part === '..')
  ) {
    throw new Error(`Not a key of the static site: "${key}"`);
  }
}

/** The suffix of a file being written: never a key of the site. */
const TEMPORARY_SUFFIX = '.tmp';

/** Files whose ETag a directory store remembers at most. */
const MAX_KNOWN_ETAGS = 100_000;

const isMissingFile = (error: unknown) => {
  const code = (error as NodeJS.ErrnoException).code;
  return code === 'ENOENT' || code === 'EISDIR' || code === 'ENOTDIR';
};

/**
 * The directory store: reads the file of a key on every request. Its ETag is the hash of the
 * file, computed once per version of it (its inode, size and time): a request it matches is
 * answered without reading the file. A conditional write checks the file just before it
 * replaces it, which keeps apart writers of one site that do not run at the same instant.
 */
export function createFsStore(dir: string): StaticStore {
  const root = path.resolve(dir);
  const etags = new Map<string, { version: string; etag: string }>();
  const versionOf = (stats: { ino: number; size: number; mtimeMs: number }) =>
    `${stats.ino}:${stats.size}:${stats.mtimeMs}`;

  const currentEtag = async (file: string): Promise<string | null> => {
    try {
      return quoteEtag(contentHash(await readFile(file)));
    } catch (error) {
      if (isMissingFile(error)) return null;
      throw error;
    }
  };

  return {
    url: `fs:${root}`,
    kind: 'fs',
    async read(key, { ifNoneMatch } = {}) {
      assertKey(key);
      const file = path.join(root, key);
      let version: string;
      try {
        const stats = await stat(file);
        if (!stats.isFile()) return { status: 'missing' };
        version = versionOf(stats);
      } catch (error) {
        if (isMissingFile(error)) return { status: 'missing' };
        throw error;
      }
      const known = etags.get(key);
      if (known?.version === version && etagMatches(ifNoneMatch, known.etag)) {
        return { status: 'not-modified', etag: known.etag };
      }
      let body: Buffer;
      try {
        body = await readFile(file);
      } catch (error) {
        if (isMissingFile(error)) return { status: 'missing' };
        throw error;
      }
      let etag = known?.version === version ? known.etag : null;
      if (!etag) {
        etag = quoteEtag(contentHash(body));
        if (etags.size >= MAX_KNOWN_ETAGS) etags.clear();
        etags.set(key, { version, etag });
      }
      if (etagMatches(ifNoneMatch, etag)) {
        return { status: 'not-modified', etag };
      }
      return { status: 'found', body, etag, contentType: contentTypeOf(key) };
    },
    async write(key, body, _contentType, options = {}) {
      assertKey(key);
      const file = path.join(root, key);
      await mkdir(path.dirname(file), { recursive: true });
      // Whole or not at all: a server reading the directory never sees half a file.
      const temporary = `${file}.${process.pid}.${randomBytes(6).toString('hex')}${TEMPORARY_SUFFIX}`;
      try {
        await writeFile(temporary, body);
        if (options.ifMatch !== undefined || options.ifNoneMatch) {
          const current = await currentEtag(file);
          if (
            (options.ifNoneMatch && current !== null) ||
            (options.ifMatch !== undefined && current !== options.ifMatch)
          ) {
            throw new StaticWriteConflict(key);
          }
        }
        await rename(temporary, file);
      } catch (error) {
        await rm(temporary, { force: true });
        throw error;
      }
    },
    async remove(key) {
      assertKey(key);
      await rm(path.join(root, key), { force: true });
    },
    async list(prefix = '') {
      const keys: string[] = [];
      const walk = async (dirPath: string) => {
        let entries;
        try {
          entries = await readdir(dirPath, { withFileTypes: true });
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
          throw error;
        }
        for (const entry of entries) {
          const full = path.join(dirPath, entry.name);
          if (entry.isDirectory()) await walk(full);
          else if (!entry.name.endsWith(TEMPORARY_SUFFIX)) {
            keys.push(path.relative(root, full).split(path.sep).join('/'));
          }
        }
      };
      await walk(root);
      return keys.filter((key) => key.startsWith(prefix)).sort();
    },
  };
}

/** Whether a directory exists. */
export async function isDirectory(dir: string): Promise<boolean> {
  try {
    return (await stat(dir)).isDirectory();
  } catch {
    return false;
  }
}

/**
 * The credentials and the endpoint of the S3 API, from the environment:
 * `STOREFRONT_STATIC_S3_ENDPOINT` (`https://<account>.r2.cloudflarestorage.com`),
 * `STOREFRONT_STATIC_S3_REGION` (`auto` by default), `STOREFRONT_STATIC_S3_ACCESS_KEY_ID`,
 * `STOREFRONT_STATIC_S3_SECRET_ACCESS_KEY`.
 */
function s3Settings(env: Record<string, string | undefined>) {
  const endpoint = env.STOREFRONT_STATIC_S3_ENDPOINT?.trim();
  const accessKeyId = env.STOREFRONT_STATIC_S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = env.STOREFRONT_STATIC_S3_SECRET_ACCESS_KEY?.trim();
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'An s3:// static store needs STOREFRONT_STATIC_S3_ENDPOINT, ' +
        'STOREFRONT_STATIC_S3_ACCESS_KEY_ID and STOREFRONT_STATIC_S3_SECRET_ACCESS_KEY'
    );
  }
  return {
    endpoint,
    region: env.STOREFRONT_STATIC_S3_REGION?.trim() || 'auto',
    credentials: { accessKeyId, secretAccessKey },
  };
}

/** The bucket store: objects under `prefix`, read with conditional requests. */
export function createS3Store(
  bucket: string,
  prefix: string,
  options: {
    env?: Record<string, string | undefined>;
    fetch?: typeof fetch;
  } = {}
): StaticStore {
  const client = new S3Client({
    ...s3Settings(options.env ?? process.env),
    bucket,
    fetch: options.fetch,
  });
  const base = prefix.replace(/^\/+|\/+$/g, '');
  const full = (key: string) => (base ? `${base}/${key}` : key);
  return {
    url: `s3://${bucket}${base ? `/${base}` : ''}`,
    kind: 's3',
    async read(key, { ifNoneMatch } = {}) {
      assertKey(key);
      const response = await client.send({
        method: 'GET',
        key: full(key),
        headers: ifNoneMatch ? { 'if-none-match': ifNoneMatch } : {},
      });
      if (response.status === 404) {
        await response.body?.cancel();
        return { status: 'missing' };
      }
      const etag = response.headers.get('etag') ?? '';
      if (response.status === 304) {
        return { status: 'not-modified', etag: etag || ifNoneMatch || '' };
      }
      if (!response.ok) {
        await response.body?.cancel();
        throw new Error(
          `Reading ${key} from s3://${bucket} failed: ${response.status}`
        );
      }
      return {
        status: 'found',
        body: Buffer.from(await response.arrayBuffer()),
        etag,
        contentType: response.headers.get('content-type') ?? contentTypeOf(key),
      };
    },
    async write(key, body, contentType, options = {}) {
      assertKey(key);
      const response = await client.send({
        method: 'PUT',
        key: full(key),
        headers: {
          'content-type': contentType,
          ...(options.ifMatch !== undefined
            ? { 'if-match': options.ifMatch }
            : {}),
          ...(options.ifNoneMatch
            ? { 'if-none-match': options.ifNoneMatch }
            : {}),
        },
        body: typeof body === 'string' ? body : new Uint8Array(body),
      });
      await response.body?.cancel();
      if (response.status === 412) throw new StaticWriteConflict(key);
      if (!response.ok) {
        throw new Error(
          `Writing ${key} to s3://${bucket} failed: ${response.status}`
        );
      }
    },
    async remove(key) {
      assertKey(key);
      const response = await client.send({ method: 'DELETE', key: full(key) });
      await response.body?.cancel();
      if (!response.ok && response.status !== 404) {
        throw new Error(
          `Deleting ${key} from s3://${bucket} failed: ${response.status}`
        );
      }
    },
    async list(prefix = '') {
      const keys = await client.list(full(prefix));
      return keys
        .map((key) => (base ? key.slice(base.length + 1) : key))
        .sort();
    },
  };
}

/**
 * The store of `STOREFRONT_STATIC_STORE`-style address: `s3://<bucket>/<prefix>` or
 * `fs:<dir>` (relative to `cwd`).
 */
export function openStaticStore(
  address: string,
  options: {
    cwd?: string;
    env?: Record<string, string | undefined>;
    fetch?: typeof fetch;
  } = {}
): StaticStore {
  if (address.startsWith('s3://')) {
    const [bucket, ...rest] = address.slice('s3://'.length).split('/');
    if (!bucket) throw new Error(`No bucket in the static store "${address}"`);
    return createS3Store(bucket, rest.join('/'), options);
  }
  if (address.startsWith('fs:')) {
    return createFsStore(
      path.resolve(options.cwd ?? process.cwd(), address.slice('fs:'.length))
    );
  }
  throw new Error(
    `The static store "${address}" is neither s3://<bucket>/<prefix> nor fs:<dir>`
  );
}
