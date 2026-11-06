import type { LoaderFunctionArgs } from 'react-router';
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
import type { RuntimeAppDefinition } from './app';
import { runtimeRequestLocale } from './server';

/**
 * The resource routes of search engines: `robots.txt`, `sitemap.xml` and the sitemap files.
 * They run under the runtime middleware, in the store's default language (their addresses
 * have no locale segment); the sitemaps list every page in each store language.
 */
export function createSeoRoutes(
  app: RuntimeAppDefinition,
  seo: RuntimeSeoDefinition
) {
  const services = createRuntimePageServices(app.environmentConfig);

  function siteOf({ request, context }: LoaderFunctionArgs): RuntimeSite {
    const { locales } = context.get(runtimeRequestLocale);
    return {
      origin: publicOrigin(request.url),
      locale: locales.defaultLocale,
      locales,
      localePrefix: app.routing.localePrefix,
    };
  }

  return {
    robotsLoader: (args: LoaderFunctionArgs) =>
      robotsResponse(buildRobotsTxt(seo, siteOf(args))),
    sitemapIndexLoader: async (args: LoaderFunctionArgs) =>
      sitemapResponse(await buildSitemapIndex(seo, siteOf(args), { services })),
    sitemapFileLoader: async (args: LoaderFunctionArgs) =>
      sitemapResponse(
        await buildSitemapFile(
          seo,
          siteOf(args),
          { services },
          args.params.file ?? ''
        )
      ),
  };
}
