import type { Metadata } from 'next';
import { headers } from 'next/headers';
import type { ApolloEnvironmentConfig } from '@shopana/storefront-sdk/graphql/apollo/types';
import {
  loadStorefrontLocales,
  resolveStorefrontLocale,
} from '@shopana/storefront-sdk/modules/localization/server';
import type { StorefrontRoutingConfig } from '@shopana/storefront-sdk/routing';
import type { RuntimeMetadata } from '../core/metadata';
import { createRuntimePageServices } from '../core/page-services';
import { publicOrigin } from '../core/public-origin';
import {
  buildRobotsTxt,
  buildSitemapFile,
  buildSitemapIndex,
  robotsResponse,
  sitemapResponse,
  type RuntimeSeoDefinition,
} from '../core/seo';
import type { RuntimeSite } from '../core/site';

/**
 * The site of a request under Next.js: the public origin, the store languages and the one of
 * the locale segment (the default one without a segment).
 */
export async function loadNextSite(options: {
  environmentConfig: ApolloEnvironmentConfig;
  routing: StorefrontRoutingConfig;
  requestUrl: string;
  localeSegment?: string | null;
}): Promise<RuntimeSite> {
  const locales = await loadStorefrontLocales(options.environmentConfig);
  return {
    origin: publicOrigin(options.requestUrl),
    locale: resolveStorefrontLocale(locales, options.localeSegment),
    locales,
    localePrefix: options.routing.localePrefix,
  };
}

/** The URL of a route handler's request, on the host the client asked for. */
async function handlerRequestUrl(request: Request): Promise<string> {
  const host = (await headers()).get('host');
  const url = new URL(request.url);
  if (host) url.host = host;
  return url.href;
}

/**
 * The route handlers of search engines: `app/robots.txt/route.ts`, `app/sitemap.xml/route.ts`
 * and `app/sitemaps/[file]/route.ts`, in the store's default language (the middleware leaves
 * static addresses alone).
 */
export function createSeoRouteHandlers(options: {
  environmentConfig: ApolloEnvironmentConfig;
  routing: StorefrontRoutingConfig;
  seo: RuntimeSeoDefinition;
}) {
  const { environmentConfig, routing, seo } = options;
  const services = createRuntimePageServices(environmentConfig);
  const siteOf = async (request: Request) =>
    loadNextSite({
      environmentConfig,
      routing,
      requestUrl: await handlerRequestUrl(request),
    });

  return {
    robots: async (request: Request) =>
      robotsResponse(buildRobotsTxt(seo, await siteOf(request))),
    sitemapIndex: async (request: Request) =>
      sitemapResponse(
        await buildSitemapIndex(seo, await siteOf(request), { services })
      ),
    sitemapFile: async (
      request: Request,
      { params }: { params: Promise<{ file: string }> }
    ) =>
      sitemapResponse(
        await buildSitemapFile(
          seo,
          await siteOf(request),
          { services },
          (await params).file
        )
      ),
  };
}

function nextImages(
  images: NonNullable<RuntimeMetadata['openGraph']>['images']
) {
  return images as NonNullable<Metadata['openGraph']>['images'];
}

/**
 * Page metadata as the `Metadata` of Next.js. The Open Graph type and tags of a `product`, which
 * Next.js does not know, and `jsonLd` are rendered by the page itself (`PageHead`).
 */
export function toNextMetadata(metadata: RuntimeMetadata): Metadata {
  const { openGraph, twitter, jsonLd: _jsonLd, ...rest } = metadata;
  let nextOpenGraph: Metadata['openGraph'];
  if (openGraph) {
    const base = {
      title: openGraph.title,
      description: openGraph.description,
      url: openGraph.url,
      siteName: openGraph.siteName,
      locale: openGraph.locale,
      alternateLocale: openGraph.alternateLocales,
      images: nextImages(openGraph.images),
    };
    if (openGraph.type === 'article') {
      nextOpenGraph = { ...base, type: 'article', ...openGraph.article };
    } else if (openGraph.type === 'product') {
      // `og:type` comes with the product tags (`PageHead`).
      nextOpenGraph = base;
    } else {
      nextOpenGraph = { ...base, type: 'website' };
    }
  }
  return {
    ...rest,
    alternates: rest.alternates ?? undefined,
    ...(nextOpenGraph ? { openGraph: nextOpenGraph } : {}),
    ...(twitter
      ? {
          twitter: {
            card: twitter.card,
            title: twitter.title,
            description: twitter.description,
            images: nextImages(twitter.images),
          } as Metadata['twitter'],
        }
      : {}),
  };
}
