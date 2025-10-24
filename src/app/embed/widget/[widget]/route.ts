/**
 * JavaScript widget delivery endpoint.
 *
 * Resolves a widget by slug via the modules registry and returns its JavaScript source.
 * Implements robust caching (ETag + conditional GET), CORS, and security headers.
 * Provides GET/HEAD/OPTIONS handlers following production best practices.
 */
import '@src/modules';
import { moduleRegistry, type WidgetSourceLoader } from '@src/modules/registry';

/**
 * Standard headers for JavaScript widget responses.
 */
const JS_HEADERS = {
  'content-type': 'text/javascript; charset=utf-8',
  'cache-control': 'public, max-age=0, must-revalidate',
} as const;

/**
 * GET handler serving the JavaScript source for a widget.
 *
 * @param request Standard Request object.
 * @param context Route context with `params.widget` specifying the widget slug.
 * @returns JavaScript response, 304 if ETag matches, or an error response with proper headers.
 */
export async function GET(
  request: Request,
  context: { params: { widget: string } }
) {
  try {
    const url = new URL(request.url);

    const slug = context.params.widget;
    if (!/^[a-z0-9][a-z0-9-_]{0,63}$/i.test(slug)) {
      return withHeaders(
        new Response('// invalid widget', { status: 400, headers: JS_HEADERS })
      );
    }
    const getWidgetLoader = moduleRegistry.resolve<WidgetSourceLoader>(
      'widget',
      slug
    );
    if (!getWidgetLoader) {
      return withHeaders(
        new Response('// widget not found', {
          status: 404,
          headers: JS_HEADERS,
        })
      );
    }
    const widgetLoader = await getWidgetLoader();
    const source = await widgetLoader({
      origin: url.origin,
      widget: slug,
      searchParams: url.searchParams,
    });
    const etag = await etagOf(source);
    const inm = request.headers.get('if-none-match');
    if (inm && inm === etag) {
      return withHeaders(
        new Response(null, {
          status: 304,
          headers: { ...JS_HEADERS, ETag: etag },
        })
      );
    }
    return withHeaders(
      new Response(source, {
        status: 200,
        headers: { ...JS_HEADERS, ETag: etag },
      })
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return withHeaders(
      new Response(`// failed to load widget: ${message}`, {
        status: 500,
        headers: JS_HEADERS,
      })
    );
  }
}

/**
 * HEAD handler for widget requests.
 * Validates the slug and presence of a registered widget without loading content.
 * Returns 200/404/400 accordingly with standard headers.
 *
 * @param request Standard Request object.
 * @param context Route context with `params.widget` specifying the widget slug.
 */
export async function HEAD(
  request: Request,
  context: { params: { widget: string } }
) {
  const slug = context.params.widget;
  if (!/^[a-z0-9][a-z0-9-_]{0,63}$/i.test(slug)) {
    return withHeaders(
      new Response(null, { status: 400, headers: JS_HEADERS })
    );
  }
  const getWidgetLoader = moduleRegistry.resolve<WidgetSourceLoader>(
    'widget',
    slug
  );
  if (!getWidgetLoader) {
    return withHeaders(
      new Response(null, { status: 404, headers: JS_HEADERS })
    );
  }
  return withHeaders(new Response(null, { status: 200, headers: JS_HEADERS }));
}

/**
 * OPTIONS handler for CORS preflight.
 * Returns 204 with allow headers and long max-age for preflight caching.
 */
export function OPTIONS() {
  return withHeaders(
    new Response(null, {
      status: 204,
      headers: {
        ...JS_HEADERS,
        'access-control-max-age': '86400',
        'access-control-allow-headers': 'Content-Type, If-None-Match, ETag',
      },
    })
  );
}

/**
 * Ensures all responses include CORS and security headers, default content-type/cache-control,
 * and Vary: Origin for proper proxy/CDN behavior.
 *
 * @param r Base response to decorate.
 * @returns Response with enforced standard headers.
 */
function withHeaders(r: Response) {
  const h = new Headers(r.headers);
  h.set('access-control-allow-origin', '*');
  h.set('access-control-allow-methods', 'GET, HEAD, OPTIONS');
  h.set('access-control-allow-headers', 'Content-Type, If-None-Match, ETag');
  h.set('x-content-type-options', 'nosniff');
  const vary = h.get('vary');
  if (vary) {
    if (!/\bOrigin\b/i.test(vary)) h.set('vary', vary + ', Origin');
  } else {
    h.set('vary', 'Origin');
  }
  if (!h.has('content-type')) h.set('content-type', JS_HEADERS['content-type']);
  if (!h.has('cache-control'))
    h.set('cache-control', JS_HEADERS['cache-control']);
  return new Response(r.body, {
    status: r.status,
    statusText: r.statusText,
    headers: h,
  });
}

/**
 * Computes a stable ETag for a given JavaScript string.
 * Uses SHA-256 truncated to 16 bytes for compactness, with a light-weight fallback when crypto is unavailable.
 *
 * @param text JavaScript source to hash.
 * @returns Strong ETag of the form "sha256-<hex>" or a weak fallback when crypto is not available.
 */
async function etagOf(text: string): Promise<string> {
  try {
    const data = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const hex = Array.from(new Uint8Array(hash).slice(0, 16))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `"sha256-${hex}"`;
  } catch {
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
    return `W/"len${text.length}-h${(h >>> 0).toString(16)}"`;
  }
}
