import React from 'react';
import type { NormalizedCacheObject } from '@apollo/client';
import { App } from './App';
import type { CartConfig } from './modules/cart/core/config';
import type { ApolloEnvironmentConfig } from './graphql/apollo/types';
import { loadCartServerQuery } from './modules/cart/next/loaders/loadCartServerQuery';
import { loadSessionServerQuery } from './modules/session/next/loaders/loadSessionServerQuery';
import { setEnvironmentConfig } from './config';
import { mergeApolloCacheStates } from './graphql/apollo/cache';
import { getApolloRequestClient } from './next/apollo/server';
import type { StorefrontRoutingConfig } from './modules/localization/core/types';
import { getStorefrontRequestContext } from './modules/store/server/getStorefrontRequestContext';
import { preloadNavigationMenus } from './modules/content/server';

export interface AppPreloadConfig {
  /** Navigation menu handles the layout renders; they are part of the server HTML. */
  navigationMenus?: readonly string[];
}

export interface AppProviderProps {
  children: React.ReactNode;
  environmentConfig: ApolloEnvironmentConfig;
  /** Optional normalized cache produced before rendering the root provider. */
  apolloInitialState?: NormalizedCacheObject;
  routing: StorefrontRoutingConfig;
  cartConfig: CartConfig;
  preload?: AppPreloadConfig;
}

/**
 * App Provider (Server Component)
 *
 * Loads the store, its languages and the request localization, the cart, the session and the
 * preloaded layout queries with the request-scoped client, then hands the cache snapshot to the
 * client providers. The request locale is the one the runtime middleware resolved.
 *
 * @example
 * ```tsx
 * <AppProvider
 *   environmentConfig={environmentConfig}
 *   routing={{ localePrefix: 'as-needed' }}
 *   cartConfig={cartConfig}
 *   preload={{ navigationMenus: ['main-menu', 'footer'] }}
 * >
 *   {children}
 * </AppProvider>
 * ```
 */
export async function AppProvider({
  children,
  environmentConfig,
  apolloInitialState,
  routing,
  cartConfig,
  preload,
}: AppProviderProps) {
  setEnvironmentConfig(environmentConfig);
  const { headers } = await import('next/headers');
  const serverCookies = (await headers()).get('cookie') ?? undefined;
  const client = await getApolloRequestClient(environmentConfig);

  // Every root query shares the client registered for this server request.
  const [storefrontContext, preloadedCartQuery, initialSession] =
    await Promise.all([
      getStorefrontRequestContext(environmentConfig),
      loadCartServerQuery({
        environmentConfig,
        cartConfig,
        client,
        serverCookies,
      }),
      loadSessionServerQuery({ serverCookies }),
      preloadNavigationMenus(client, preload?.navigationMenus ?? []),
    ]);

  const initialState = mergeApolloCacheStates(
    client.extract() as NormalizedCacheObject,
    apolloInitialState
  );

  return (
    <App
      environmentConfig={environmentConfig}
      apolloInitialState={initialState}
      store={storefrontContext.store}
      localization={storefrontContext.localization}
      locale={storefrontContext.locale}
      locales={storefrontContext.locales}
      localePrefix={routing.localePrefix}
      cartConfig={cartConfig}
      initialCartId={preloadedCartQuery?.variables.checkoutId}
      initialSession={initialSession}
    >
      {children}
    </App>
  );
}
