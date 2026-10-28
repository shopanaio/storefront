import type { NormalizedCacheObject } from '@apollo/client';
import type { AppProvidersProps } from '../AppProviders';
import type { CartConfig } from '../modules/cart/core/config';
import type { ApolloEnvironmentConfig } from '../graphql/apollo/types';
import { loadCartServerQuery } from '../modules/cart/next/loaders/loadCartServerQuery';
import { loadSessionServerQuery } from '../modules/session/next/loaders/loadSessionServerQuery';
import { setEnvironmentConfig } from '../config';
import { mergeApolloCacheStates } from '../graphql/apollo/cache';
import type { StorefrontRoutingConfig } from '../modules/localization/core/types';
import { getStorefrontRequestContext } from '../modules/store/server/getStorefrontRequestContext';
import { preloadNavigationMenus } from '../modules/content/server';
import { getApolloRequestClient } from './apollo';
import { readServerRequestHeaders } from './requestScope';

export interface AppPreloadConfig {
  /** Navigation menu handles the layout renders; they are part of the server HTML. */
  navigationMenus?: readonly string[];
}

export interface LoadAppPropsOptions {
  environmentConfig: ApolloEnvironmentConfig;
  routing: StorefrontRoutingConfig;
  cartConfig: CartConfig;
  preload?: AppPreloadConfig;
  /** Optional normalized cache produced before the root providers render. */
  apolloInitialState?: NormalizedCacheObject;
}

/** What the server hands the root providers: plain data, safe to send to the browser. */
export type ServerAppProps = Omit<
  AppProvidersProps,
  'children' | 'environmentConfig' | 'cartConfig'
> & {
  apolloInitialState: NormalizedCacheObject;
};

/**
 * Loads the store and its languages, the cart, the session and the preloaded layout queries
 * with the request-scoped client, and returns them with the cache snapshot for the root
 * providers. The request locale is the one the runtime middleware resolved.
 */
export async function loadAppProps({
  environmentConfig,
  routing,
  cartConfig,
  preload,
  apolloInitialState,
}: LoadAppPropsOptions): Promise<ServerAppProps> {
  setEnvironmentConfig(environmentConfig);
  const serverCookies =
    (await readServerRequestHeaders()).get('cookie') ?? undefined;
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

  return {
    apolloInitialState: mergeApolloCacheStates(
      client.extract() as NormalizedCacheObject,
      apolloInitialState
    ),
    store: storefrontContext.store,
    locale: storefrontContext.locale,
    locales: storefrontContext.locales,
    localePrefix: routing.localePrefix,
    initialCartId: preloadedCartQuery?.variables.checkoutId,
    initialSession,
  };
}
