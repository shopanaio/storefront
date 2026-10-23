import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import type { ApolloEnvironmentConfig } from '@shopana/storefront-sdk/graphql/apollo/types';
import {
  loadStorefrontLocales,
  resolveStorefrontLocale,
} from '@shopana/storefront-sdk/modules/localization/server';
import {
  STOREFRONT_LOCALE_HEADER,
  splitLocaleFromPathname,
  type StorefrontLocales,
  type StorefrontRoutingConfig,
} from '@shopana/storefront-sdk/routing';

export * from 'next/server';

type MiddlewareResult =
  | NextResponse
  | Response
  | Promise<NextResponse | Response | undefined | void>
  | undefined
  | void;

export interface RuntimeMiddlewareContext {
  /** Store languages the locale segment of the request was matched against. */
  locales: StorefrontLocales;
}

type MiddlewareFunction = (
  request: NextRequest,
  context: RuntimeMiddlewareContext
) => MiddlewareResult;

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

function applyRequestContext(
  response: Response,
  request: NextRequest,
  localeTag: string
): Response {
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
  requestHeaders.set(STOREFRONT_LOCALE_HEADER, localeTag);

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

type IntlMiddleware = ReturnType<typeof createIntlMiddleware>;

const intlMiddlewares = new Map<string, IntlMiddleware>();

/** next-intl routing over the store languages; rebuilt only when the languages change. */
function getIntlMiddleware(
  locales: StorefrontLocales,
  routing: StorefrontRoutingConfig
): IntlMiddleware {
  const segments = locales.locales.map((locale) => locale.segment);
  const key = JSON.stringify([
    locales.defaultLocale.segment,
    segments,
    routing.localePrefix,
  ]);
  let middleware = intlMiddlewares.get(key);
  if (!middleware) {
    middleware = createIntlMiddleware({
      locales: segments,
      defaultLocale: locales.defaultLocale.segment,
      localePrefix: routing.localePrefix,
      localeDetection: false,
    });
    intlMiddlewares.set(key, middleware);
  }
  return middleware;
}

export interface CreateRuntimeMiddlewareOptions {
  environmentConfig: ApolloEnvironmentConfig;
  routing: StorefrontRoutingConfig;
  /** Runs before locale routing; a returned response ends the request. */
  middleware?: MiddlewareFunction;
}

/**
 * Creates the storefront middleware: matches the locale segment against the store languages,
 * applies next-intl locale routing and passes the request URL and locale to server rendering.
 *
 * @example
 * ```ts
 * // src/runtime/middleware.ts
 * export default createRuntimeMiddleware({
 *   environmentConfig,
 *   routing: { localePrefix: 'as-needed' },
 * });
 * ```
 */
export function createRuntimeMiddleware(
  options: CreateRuntimeMiddlewareOptions
) {
  return async function sdkMiddleware(request: NextRequest) {
    const locales = await loadStorefrontLocales(options.environmentConfig);
    const segment = splitLocaleFromPathname(
      request.nextUrl.pathname,
      locales.locales.map((locale) => locale.segment)
    ).locale;
    const localeTag = resolveStorefrontLocale(locales, segment).tag;

    const custom = await options.middleware?.(request, { locales });
    if (custom) {
      return applyRequestContext(
        custom instanceof NextResponse ? custom : cloneResponse(custom),
        request,
        localeTag
      );
    }

    const response = await getIntlMiddleware(locales, options.routing)(request);
    return applyRequestContext(response, request, localeTag);
  };
}

/**
 * Default matcher that excludes framework, API, session (`/auth/*`) and embedded-app routes.
 */
export const defaultMatcher =
  '/((?!api|auth/|trpc|_next|_vercel|embed|.*\\.(?:avif|css|gif|ico|jpeg|jpg|js|json|map|mjs|mp4|pdf|png|svg|txt|webmanifest|webp|woff|woff2|xml)$).*)';
