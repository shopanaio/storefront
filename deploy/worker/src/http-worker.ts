/** Public S3 over HTTPS; CDN misses reach the existing Traefik → Node path. */
import {
  handleRequest,
  type SiteBucket,
  type WorkerEnv,
  type WorkerContext,
  type EdgeCache,
} from './worker';

export interface HttpWorkerEnv extends Omit<WorkerEnv, 'SITE'> {
  SITE_ORIGIN: string;
}

export function httpBucket(
  origin: string,
  fetcher: typeof fetch = fetch
): SiteBucket {
  const base = new URL(origin.endsWith('/') ? origin : `${origin}/`);
  if (
    base.protocol !== 'https:' ||
    base.username ||
    base.password ||
    base.search ||
    base.hash
  ) {
    throw new Error('SITE_ORIGIN must be a public HTTPS bucket URL');
  }
  return {
    async get(key) {
      const target = new URL(
        key.split('/').map(encodeURIComponent).join('/'),
        base
      );
      const response = await fetcher(target, {
        redirect: 'manual',
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
        headers: { Accept: '*/*' },
      });
      if (response.status !== 200) {
        await response.body?.cancel();
        if (response.status === 404) return null;
        throw new Error(`Static origin HTTP ${response.status}`);
      }
      return {
        body: response.body,
        httpEtag: response.headers.get('ETag') ?? '',
        httpMetadata: {
          contentType:
            response.headers.get('Content-Type') ?? 'text/html; charset=utf-8',
        },
        customMetadata: {
          'cache-tag': response.headers.get('x-amz-meta-cache-tag') ?? '',
        },
      };
    },
  };
}

export default {
  fetch(
    request: Request,
    env: HttpWorkerEnv,
    ctx: WorkerContext
  ): Promise<Response> {
    return handleRequest(
      request,
      { ...env, SITE: httpBucket(env.SITE_ORIGIN) },
      ctx,
      {
        cache: (globalThis as unknown as { caches: { default: EdgeCache } })
          .caches.default,
      }
    );
  },
};
