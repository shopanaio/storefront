import React from 'react';
import type { NormalizedCacheObject } from '@apollo/client';
import { App } from './App';
import type { ShopConfig } from './shop/types';
import type { CartConfig } from './modules/cart/core/config';
import type { ApolloEnvironmentConfig } from './graphql/apollo/types';
import { loadCartServerQuery } from './modules/cart/next/loaders/loadCartServerQuery';
import { loadSessionServerQuery } from './modules/session/next/loaders/loadSessionServerQuery';
import { setEnvironmentConfig } from './config';
import { mergeApolloCacheStates } from './graphql/apollo/cache';
import { getApolloRequestClient } from './next/apollo/server';
import type { LocalizationConfig } from './modules/localization/core/types';

export interface AppProviderProps {
  children: React.ReactNode;
  /**
   * Apollo environment configuration
   */
  environmentConfig: ApolloEnvironmentConfig;
  /** Optional normalized cache produced before rendering the root provider. */
  apolloInitialState?: NormalizedCacheObject;
  /**
   * Shop configuration (currency, locale, features)
   */
  shopConfig: ShopConfig;
  localizationConfig: LocalizationConfig;
  /**
   * Cart configuration
   */
  cartConfig: CartConfig;
}

/**
 * App Provider (Server Component)
 *
 * Main wrapper component that handles SSR cart and session loading internally.
 * This is an async Server Component that:
 * 1. Loads cart data on the server using cookies
 * 2. Loads session data on the server using cookies
 * 3. Passes preloaded data to the client App component
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { AppProvider } from '@shopana/storefront-sdk';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AppProvider
 *           environmentConfig={environmentConfig}
 *           shopConfig={shopConfig}
 *           cartConfig={cartConfig}
 *         >
 *           {children}
 *         </AppProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export async function AppProvider({
  children,
  environmentConfig,
  apolloInitialState,
  shopConfig,
  localizationConfig,
  cartConfig,
}: AppProviderProps) {
  setEnvironmentConfig(environmentConfig);
  const { headers } = await import('next/headers');
  const serverCookies = (await headers()).get('cookie') ?? undefined;
  const client = await getApolloRequestClient(environmentConfig);

  // Both root queries share the client registered for this server request.
  const [preloadedCartQuery, initialSession] = await Promise.all([
    loadCartServerQuery({
      environmentConfig,
      cartConfig,
      client,
      serverCookies,
    }),
    loadSessionServerQuery({
      environmentConfig,
      serverCookies,
    }),
  ]);

  const initialState = mergeApolloCacheStates(
    client.extract() as NormalizedCacheObject,
    apolloInitialState
  );

  return (
    <App
      environmentConfig={environmentConfig}
      apolloInitialState={initialState}
      shopConfig={shopConfig}
      localizationConfig={localizationConfig}
      cartConfig={cartConfig}
      initialCartId={preloadedCartQuery?.variables.checkoutId}
      initialSession={initialSession}
    >
      {children}
    </App>
  );
}
