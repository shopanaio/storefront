/**
 * What the static site builder reads from a theme's server build (`entry.server`'s
 * `staticSite`): its config and the addresses to render, enumerated with the build's own SDK
 * and a guest client of the Storefront API, as the pages load their data.
 */
import { createApolloClient } from '@shopana/storefront-sdk/graphql/apollo';
import { loadStorefrontLocales } from '@shopana/storefront-sdk/modules/localization/server';
import type {
  StorefrontLocale,
  StorefrontLocales,
  StorefrontRoutingConfig,
} from '@shopana/storefront-sdk/routing';
import { privateTokenHeaders } from '@shopana/storefront-sdk/server/directGateway';
import {
  enumerateStaticRoutes,
  type StaticRoute,
  type StaticSiteConfig,
} from '@shopana/storefront-sdk/static';
import type { RuntimeAppDefinition } from './app';

export interface StaticSiteEntry {
  config: StaticSiteConfig;
  routing: StorefrontRoutingConfig;
  /** The store languages the config renders, and the store's default. */
  locales(): Promise<{
    all: StorefrontLocales;
    rendered: readonly StorefrontLocale[];
  }>;
  /** The addresses of the config in one language, without the locale segment. */
  routes(locale: StorefrontLocale): Promise<StaticRoute[]>;
}

export function createStaticSiteEntry(
  app: RuntimeAppDefinition,
  config: StaticSiteConfig
): StaticSiteEntry {
  return {
    config,
    routing: app.routing,
    async locales() {
      const all = await loadStorefrontLocales(app.environmentConfig);
      const rendered =
        config.locales === 'all'
          ? all.locales
          : config.locales.map((segment) => {
              const locale = all.locales.find(
                (item) => item.segment.toLowerCase() === segment.toLowerCase()
              );
              if (!locale) {
                throw new Error(
                  `The static site renders "${segment}", which is no language of the store`
                );
              }
              return locale;
            });
      return { all, rendered };
    },
    routes(locale) {
      const client = createApolloClient(app.environmentConfig, {
        locale: locale.tag,
        gatewayHeaders: privateTokenHeaders(),
      });
      return enumerateStaticRoutes(config, {
        locale,
        client,
        navigationMenus: app.preload?.navigationMenus ?? [],
      });
    },
  };
}
