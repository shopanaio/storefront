/**
 * A small client of the S3 API (Cloudflare R2, MinIO, Spaces): the objects of one bucket read,
 * written, listed and deleted with Signature V4, over `fetch`. Only what the static site needs.
 */
import { createHash, createHmac } from 'node:crypto';

export interface S3Credentials {
  accessKeyId: string;
  secretAccessKey: string;
}

export interface S3ClientOptions {
  /** `https://<account>.r2.cloudflarestorage.com`; the bucket is the first path segment. */
  endpoint: string;
  /** `auto` for R2. */
  region: string;
  bucket: string;
  credentials: S3Credentials;
  fetch?: typeof fetch;
  /** The clock of the signatures. */
  now?: () => Date;
}

/** Path segments as S3 signs them: every byte but the unreserved ones encoded. */
function encodeSegment(segment: string): string {
  return encodeURIComponent(segment).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

const sha256 = (data: string | Uint8Array) =>
  createHash('sha256').update(data).digest('hex');
const hmac = (key: string | Buffer, data: string) =>
  createHmac('sha256', key).update(data).digest();

/** The time of a signature: `20261106T120000Z` and its day. */
function amzDate(date: Date): { stamp: string; day: string } {
  const stamp = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  return { stamp, day: stamp.slice(0, 8) };
}

export interface S3Request {
  method: 'GET' | 'HEAD' | 'PUT' | 'DELETE' | 'POST';
  /** Object key, without the bucket; empty for the bucket itself. */
  key: string;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  body?: Uint8Array | string;
}

/**
 * How long a request may take: a read sits on the path of a page request (the server renders
 * the page instead when it fails), a write is the builder's.
 */
const READ_TIMEOUT_MS = 5_000;
const WRITE_TIMEOUT_MS = 60_000;

/** Signature V4 headers of a request: `Authorization`, `x-amz-date`, `x-amz-content-sha256`. */
export function signS3Request(
  options: Pick<S3ClientOptions, 'region' | 'credentials'>,
  request: { method: string; url: URL; headers: Record<string, string> },
  date: Date,
  payloadHash: string
): Record<string, string> {
  const { stamp, day } = amzDate(date);
  const headers: Record<string, string> = {
    ...Object.fromEntries(
      Object.entries(request.headers).map(([name, value]) => [
        name.toLowerCase(),
        value.trim(),
      ])
    ),
    host: request.url.host,
    'x-amz-date': stamp,
    'x-amz-content-sha256': payloadHash,
  };
  const names = Object.keys(headers).sort();
  const canonicalQuery = [...request.url.searchParams.entries()]
    .map(([name, value]) => [encodeSegment(name), encodeSegment(value)])
    .sort(([a, x], [b, y]) => (a === b ? (x < y ? -1 : 1) : a < b ? -1 : 1))
    .map(([name, value]) => `${name}=${value}`)
    .join('&');
  const canonicalRequest = [
    request.method,
    request.url.pathname,
    canonicalQuery,
    names.map((name) => `${name}:${headers[name]}\n`).join(''),
    names.join(';'),
    payloadHash,
  ].join('\n');
  const scope = `${day}/${options.region}/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    stamp,
    scope,
    sha256(canonicalRequest),
  ].join('\n');
  const signingKey = ['s3', 'aws4_request'].reduce(
    (key, part) => hmac(key, part),
    hmac(
      hmac(`AWS4${options.credentials.secretAccessKey}`, day),
      options.region
    )
  );
  const signature = createHmac('sha256', signingKey)
    .update(stringToSign)
    .digest('hex');
  return {
    ...headers,
    authorization:
      `AWS4-HMAC-SHA256 Credential=${options.credentials.accessKeyId}/${scope}, ` +
      `SignedHeaders=${names.join(';')}, Signature=${signature}`,
  };
}

export class S3Client {
  readonly #options: S3ClientOptions;

  constructor(options: S3ClientOptions) {
    this.#options = options;
  }

  get bucket(): string {
    return this.#options.bucket;
  }

  /** The URL of an object: path style, the bucket first. */
  url(key: string, query: Record<string, string> = {}): URL {
    const base = new URL(this.#options.endpoint);
    const path = [this.#options.bucket, ...(key ? key.split('/') : [])]
      .map(encodeSegment)
      .join('/');
    const url = new URL(
      `${base.pathname.replace(/\/$/, '')}/${path}`,
      base.origin
    );
    for (const [name, value] of Object.entries(query)) {
      url.searchParams.set(name, value);
    }
    return url;
  }

  async send(request: S3Request): Promise<Response> {
    const url = this.url(request.key, request.query);
    const body =
      typeof request.body === 'string'
        ? new TextEncoder().encode(request.body)
        : request.body;
    const headers = signS3Request(
      this.#options,
      { method: request.method, url, headers: request.headers ?? {} },
      (this.#options.now ?? (() => new Date()))(),
      body ? sha256(body) : sha256('')
    );
    // `host` is the fetch's own.
    delete headers.host;
    return (this.#options.fetch ?? fetch)(url, {
      method: request.method,
      headers,
      body: body as BodyInit | undefined,
      signal: AbortSignal.timeout(
        request.method === 'GET' || request.method === 'HEAD'
          ? READ_TIMEOUT_MS
          : WRITE_TIMEOUT_MS
      ),
    });
  }

  /** Every key under `prefix`, page after page. */
  async list(prefix: string): Promise<string[]> {
    const keys: string[] = [];
    let token: string | null = null;
    do {
      const query: Record<string, string> = { 'list-type': '2', prefix };
      if (token) query['continuation-token'] = token;
      const response = await this.send({ method: 'GET', key: '', query });
      if (!response.ok) {
        throw new Error(
          `Listing s3://${this.bucket}/${prefix} failed: ${response.status}`
        );
      }
      const xml = await response.text();
      for (const match of xml.matchAll(/<Key>([^<]*)<\/Key>/g)) {
        keys.push(decodeXml(match[1]));
      }
      token = /<IsTruncated>true<\/IsTruncated>/.test(xml)
        ? decodeXml(
            xml.match(
              /<NextContinuationToken>([^<]*)<\/NextContinuationToken>/
            )?.[1] ?? ''
          ) || null
        : null;
    } while (token);
    return keys;
  }
}

function decodeXml(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, decimal: string) =>
      String.fromCodePoint(Number(decimal))
    )
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}
