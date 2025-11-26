import { NextResponse, type NextRequest } from 'next/server';

type MiddlewareFunction = (
  request: NextRequest
) => NextResponse | Response | Promise<NextResponse | Response> | undefined | void;

export const SDK_URL_HEADER = 'x-sdk-url';
export const SDK_PATHNAME_HEADER = 'x-sdk-pathname';
export const SDK_SEARCH_HEADER = 'x-sdk-search';
export const SDK_HOST_HEADER = 'x-sdk-host';

/**
 * Creates SDK middleware that injects URL information into request headers.
 * Can be composed with other middleware.
 *
 * @example
 * ```ts
 * // middleware.ts
 * import { createSDKMiddleware } from '@shopana/storefront-sdk/next/middleware';
 * import createIntlMiddleware from 'next-intl/middleware';
 *
 * const intlMiddleware = createIntlMiddleware(routing);
 *
 * export default createSDKMiddleware({
 *   middleware: intlMiddleware,
 * });
 * ```
 */
export function createSDKMiddleware(options?: {
  middleware?: MiddlewareFunction;
}) {
  return async function sdkMiddleware(request: NextRequest) {
    // Run the wrapped middleware first if provided
    let response: NextResponse;

    if (options?.middleware) {
      const result = await options.middleware(request);

      if (result instanceof NextResponse) {
        response = result;
      } else if (result instanceof Response) {
        response = NextResponse.next();
        // Copy headers from result
        result.headers.forEach((value, key) => {
          response.headers.set(key, value);
        });
      } else {
        response = NextResponse.next();
      }
    } else {
      response = NextResponse.next();
    }

    // Inject URL information into headers
    const url = request.url;
    const pathname = request.nextUrl.pathname;
    const search = request.nextUrl.search;
    const host = request.headers.get('host') || request.nextUrl.host;

    response.headers.set(SDK_URL_HEADER, url);
    response.headers.set(SDK_PATHNAME_HEADER, pathname);
    response.headers.set(SDK_SEARCH_HEADER, search);
    response.headers.set(SDK_HOST_HEADER, host);

    return response;
  };
}

/**
 * Default matcher that excludes static files and API routes
 */
export const defaultMatcher =
  '/((?!api|trpc|_next|_vercel|embed|.*\\..*).*)';