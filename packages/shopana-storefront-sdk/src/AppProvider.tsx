import React from 'react';
import { App } from './App';
import type { ShopConfig } from './shop/types';
import type { CartConfig } from './modules/cart/core/config';
import type { RelayEnvironmentConfig } from './graphql/relay/types';
import { loadCartServerQuery } from './modules/cart/next/loaders/loadCartServerQuery';
import { loadSessionServerQuery } from './modules/session/next/loaders/loadSessionServerQuery';
import { setEnvironmentConfig } from './config';

export interface AppProviderProps {
  children: React.ReactNode;
  /**
   * Relay environment configuration
   */
  environmentConfig: RelayEnvironmentConfig;
  /**
   * Shop configuration (currency, locale, features)
   */
  shopConfig: ShopConfig;
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
  shopConfig,
  cartConfig,
}: AppProviderProps) {
  setEnvironmentConfig(environmentConfig);
  // Load cart and session data on server in parallel
  const [preloadedCartQuery, preloadedSessionQuery] = await Promise.all([
    loadCartServerQuery({
      environmentConfig,
      cartConfig,
    }),
    loadSessionServerQuery({
      environmentConfig,
    }),
  ]);

  return (
    <App
      environmentConfig={environmentConfig}
      shopConfig={shopConfig}
      cartConfig={cartConfig}
      preloadedCartQuery={preloadedCartQuery}
      preloadedSessionQuery={preloadedSessionQuery}
    >
      {children}
    </App>
  );
}
