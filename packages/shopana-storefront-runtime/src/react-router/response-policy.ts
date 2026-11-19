import { isSiteNoindex, NOINDEX_ROBOTS_TAG } from '../core/indexing';

/** How long browsers keep to HTTPS for the site once told (a year). */
const HSTS = 'max-age=31536000';

/**
 * The scheme the visitor used, as the proxy in front of the server passes it: the scheme of
 * Cloudflare's `CF-Visitor` (set at its edge, whatever hops follow), else `X-Forwarded-Proto`.
 * Null without a proxy.
 */
function forwardedScheme(headers: Headers): string | null {
  try {
    const visitor = JSON.parse(headers.get('cf-visitor') ?? 'null') as {
      scheme?: unknown;
    } | null;
    if (typeof visitor?.scheme === 'string') {
      return visitor.scheme.toLowerCase();
    }
  } catch {
    // A malformed header: the forwarded protocol decides.
  }
  const proto = headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  return proto ? proto.toLowerCase() : null;
}

/**
 * The HTTPS address of a request that reached the site over plain HTTP, on the public origin;
 * null when the site is not served over HTTPS (local development) or the request came over it.
 * `GET` and `HEAD` move permanently with 301, other methods with 308, which keeps the method.
 */
export function httpsRedirect(
  request: Request,
  url: URL,
  origin: string
): { location: string; status: 301 | 308 } | null {
  if (!origin.startsWith('https:')) return null;
  if (forwardedScheme(request.headers) !== 'http') return null;
  const method = request.method.toUpperCase();
  return {
    location: `${origin}${url.pathname}${url.search}`,
    status: method === 'GET' || method === 'HEAD' ? 301 : 308,
  };
}

/**
 * The headers every response of the site gets: `Strict-Transport-Security` when the site is
 * served over HTTPS, and `X-Robots-Tag` when the site is kept off search engines. A response
 * with headers that cannot change (a `fetch` passed through) is copied first.
 */
export function withSitePolicyHeaders(
  response: Response,
  origin: string
): Response {
  const headers: Array<[string, string]> = [];
  if (origin.startsWith('https:')) {
    headers.push(['Strict-Transport-Security', HSTS]);
  }
  if (isSiteNoindex()) headers.push(['X-Robots-Tag', NOINDEX_ROBOTS_TAG]);
  if (!headers.length) return response;
  try {
    for (const [name, value] of headers) response.headers.set(name, value);
    return response;
  } catch {
    const copy = new Response(response.body, response);
    for (const [name, value] of headers) copy.headers.set(name, value);
    return copy;
  }
}
