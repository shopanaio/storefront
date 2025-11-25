import React from 'react';
import { App } from './App';
import type { ShopConfig } from './shop/types';
import type { CartConfig } from './modules/cart/core/config';
import type { RelayEnvironmentConfig } from './graphql/relay/types';
import { loadCartServerQuery } from './modules/cart/next/loaders/loadCartServerQuery';

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
 * Main wrapper component that handles SSR cart loading internally.
 * This is an async Server Component that:
 * 1. Loads cart data on the server using cookies
 * 2. Passes preloaded data to the client App component
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
  // Load cart data on server
  const preloadedCartQuery = await loadCartServerQuery({
    environmentConfig,
    cartConfig,
  });

  return (
    <App
      environmentConfig={environmentConfig}
      shopConfig={shopConfig}
      cartConfig={cartConfig}
      preloadedCartQuery={preloadedCartQuery}
    >
      {children}
    </App>
  );
}
