import { describe, expect, it, vi } from 'vitest';
import { signS3Request } from './s3';
import { createS3Store } from './store';

const env = {
  STOREFRONT_STATIC_S3_ENDPOINT: 'https://account.r2.cloudflarestorage.com',
  STOREFRONT_STATIC_S3_ACCESS_KEY_ID: 'key',
  STOREFRONT_STATIC_S3_SECRET_ACCESS_KEY: 'secret',
};

describe('S3 signature V4', () => {
  it('signs the example request of the S3 documentation', () => {
    // "Example: GET Object" of the Signature V4 documentation of Amazon S3.
    const headers = signS3Request(
      {
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
          secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        },
      },
      {
        method: 'GET',
        url: new URL('https://examplebucket.s3.amazonaws.com/test.txt'),
        headers: { Range: 'bytes=0-9' },
      },
      new Date('2013-05-24T00:00:00Z'),
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    );
    expect(headers.authorization).toBe(
      'AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request, ' +
        'SignedHeaders=host;range;x-amz-content-sha256;x-amz-date, ' +
        'Signature=f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41'
    );
  });
});

describe('the bucket store', () => {
  it('reads with a conditional request and knows 304 and 404', async () => {
    const fetch = vi.fn(async (url: URL | RequestInfo, init?: RequestInit) => {
      const headers = init?.headers as Record<string, string>;
      expect(String(url)).toBe(
        'https://account.r2.cloudflarestorage.com/site/stage/uk/products/x/index.html'
      );
      expect(headers.authorization).toMatch(/^AWS4-HMAC-SHA256 /);
      if (headers['if-none-match'] === '"v1"') {
        return new Response(null, { status: 304, headers: { etag: '"v1"' } });
      }
      return new Response('<html>', {
        headers: { etag: '"v1"', 'content-type': 'text/html' },
      });
    });
    const store = createS3Store('site', 'stage', {
      env,
      fetch: fetch as typeof globalThis.fetch,
    });
    const found = await store.read('uk/products/x/index.html');
    expect(found).toMatchObject({ status: 'found', etag: '"v1"' });
    expect(
      await store.read('uk/products/x/index.html', { ifNoneMatch: '"v1"' })
    ).toEqual({ status: 'not-modified', etag: '"v1"' });

    const missing = createS3Store('site', 'stage', {
      env,
      fetch: (async () =>
        new Response('', { status: 404 })) as typeof globalThis.fetch,
    });
    expect(await missing.read('uk/products/x/index.html')).toEqual({
      status: 'missing',
    });
  });

  it('lists keys page after page, without its prefix', async () => {
    const pages = [
      '<ListBucketResult><Key>stage/assets/a.js</Key><IsTruncated>true</IsTruncated><NextContinuationToken>t&amp;2</NextContinuationToken></ListBucketResult>',
      '<ListBucketResult><Key>stage/assets/b.js</Key><IsTruncated>false</IsTruncated></ListBucketResult>',
    ];
    const tokens: Array<string | null> = [];
    const store = createS3Store('site', 'stage', {
      env,
      fetch: (async (url: URL) => {
        tokens.push(new URL(url).searchParams.get('continuation-token'));
        return new Response(pages.shift());
      }) as unknown as typeof globalThis.fetch,
    });
    expect(await store.list('assets/')).toEqual(['assets/a.js', 'assets/b.js']);
    expect(tokens).toEqual([null, 't&2']);
  });

  it('fails without its credentials', () => {
    expect(() => createS3Store('site', '', { env: {} })).toThrow(
      /STOREFRONT_STATIC_S3_ENDPOINT/
    );
  });
});
