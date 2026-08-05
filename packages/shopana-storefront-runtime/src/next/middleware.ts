import { NextResponse, type NextRequest } from 'next/server';

export * from 'next/server';

type MiddlewareFunction = (
  request: NextRequest
) =>
  | NextResponse
  | Response
  | Promise<NextResponse | Response>
  | undefined
  | void;

export const SDK_URL_HEADER = 'x-sdk-url';
export const SDK_PATHNAME_HEADER = 'x-sdk-pathname';
export const SDK_SEARCH_HEADER = 'x-sdk-search';
export const SDK_HOST_HEADER = 'x-sdk-host';

function cloneResponse(response: Response): Response {
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers),
  });
}

function applyRequestContext(response: Response, request: NextRequest): Response {
  const requestHeaders = new Headers(request.headers);
  const existingOverrides = response.headers
    .get('x-middleware-override-headers')
    ?.split(',')
    .map((header) => header.trim())
    .filter(Boolean);

  // Preserve request-header changes already made by composed middleware.
  for (const header of existingOverrides ?? []) {
    const value = response.headers.get(`x-middleware-request-${header}`);

    if (value === null) {
      requestHeaders.delete(header);
    } else {
      requestHeaders.set(header, value);
    }
  }

  requestHeaders.set(SDK_URL_HEADER, request.url);
  requestHeaders.set(SDK_PATHNAME_HEADER, request.nextUrl.pathname);
  requestHeaders.set(SDK_SEARCH_HEADER, request.nextUrl.search);
  requestHeaders.set(
    SDK_HOST_HEADER,
    request.headers.get('host') || request.nextUrl.host
  );

  const requestOverride = NextResponse.next({
    request: { headers: requestHeaders },
  });

  for (const header of Array.from(response.headers.keys())) {
    if (
      header === 'x-middleware-override-headers' ||
      header.startsWith('x-middleware-request-')
    ) {
      response.headers.delete(header);
    }
  }

  for (const [header, value] of requestOverride.headers) {
    if (
      header === 'x-middleware-override-headers' ||
      header.startsWith('x-middleware-request-')
    ) {
      response.headers.set(header, value);
    }
  }

  return response;
}

/**
 * Creates SDK middleware that injects URL information into request headers.
 * Can be composed with other middleware.
 *
 * @example
 * ```ts
 * // middleware.ts
 * import { createRuntimeMiddleware } from '@shopana/storefront/next/middleware';
 * import createIntlMiddleware from 'next-intl/middleware';
 *
 * const intlMiddleware = createIntlMiddleware(routing);
 *
 * export default createRuntimeMiddleware({
 *   middleware: intlMiddleware,
 * });
 * ```
 */
export function createRuntimeMiddleware(options?: {
  middleware?: MiddlewareFunction;
}) {
  return async function sdkMiddleware(request: NextRequest) {
    let response: Response;

    if (options?.middleware) {
      const result = await options.middleware(request);

      if (result instanceof NextResponse) {
        response = result;
      } else if (result instanceof Response) {
        response = cloneResponse(result);
      } else {
        response = NextResponse.next();
      }
    } else {
      response = NextResponse.next();
    }

    return applyRequestContext(response, request);
  };
}

/**
 * Default matcher that excludes framework, API, and embedded-app routes.
 */
export const defaultMatcher =
  '/((?!api|trpc|_next|_vercel|embed|.*\\.(?:avif|css|gif|ico|jpeg|jpg|js|json|map|mjs|mp4|pdf|png|svg|txt|webmanifest|webp|woff|woff2|xml)$).*)';
