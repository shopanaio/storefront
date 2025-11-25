'use client';

import React from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import type { ConcreteRequest } from 'relay-runtime/lib/util/RelayConcreteNode';
import { ShopProvider } from './shop/ShopContext';
import type { ShopConfig } from './shop/types';
import { CartProvider } from './modules/cart/react/providers/CartProvider';
import { createCartStoreZustand } from './modules/cart/react/store/CartStoreZustand';
import type { CartConfig } from './modules/cart/core/config';
import type { loadCartQuery as LoadCartQueryType } from './modules/cart/core/graphql/queries/__generated__/loadCartQuery.graphql';
import type { loadSessionQuery as LoadSessionQueryType } from './modules/session/core/graphql/queries/__generated__/loadSessionQuery.graphql';
import type { SerializablePreloadedQuery } from './graphql/relay/loadSerializableQuery';
import { useSerializablePreloadedQuery } from './graphql/relay/useSerializablePreloadedQuery';
import { createEnvironment } from './graphql/relay/Environment';
import type { RelayEnvironmentConfig } from './graphql/relay/types';
import type { Environment } from 'relay-runtime';
import { SessionProvider } from './modules/session/react/providers/SessionProvider';

// Client-side singleton
let clientEnvironment: Environment | null = null;

function getOrCreateEnvironment(config: RelayEnvironmentConfig): Environment {
  if (typeof window === 'undefined') {
    // Server: always create fresh
    return createEnvironment(config);
  }
  // Client: reuse singleton
  if (!clientEnvironment) {
    clientEnvironment = createEnvironment(config);
  }
  return clientEnvironment;
}

export interface AppProps {
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
  /**
   * Optional preloaded cart query from SSR (SerializablePreloadedQuery)
   */
  preloadedCartQuery?: SerializablePreloadedQuery<
    ConcreteRequest,
    LoadCartQueryType
  > | null;
  /**
   * Optional preloaded session query from SSR (SerializablePreloadedQuery)
   */
  preloadedSessionQuery?: SerializablePreloadedQuery<
    ConcreteRequest,
    LoadSessionQueryType
  > | null;
}

/**
 * Main App component that wraps the application with all necessary providers:
 * - RelayEnvironmentProvider (GraphQL)
 * - ShopProvider (shop config, locale, currency)
 * - CartProvider (cart state management)
 * - SessionProvider (session state management)
 */
export function App({
  children,
  environmentConfig,
  shopConfig,
  cartConfig,
  preloadedCartQuery,
  preloadedSessionQuery,
}: AppProps) {
  const environment = getOrCreateEnvironment(environmentConfig);
  // Extract initial cart entity from SSR preloaded query (for store hydration)
  const initialCart =
    preloadedCartQuery &&
    (preloadedCartQuery.response as any)?.data?.checkoutQuery?.checkout
      ? ((preloadedCartQuery.response as any).data.checkoutQuery.checkout as any)
      : null;

  // Create per-tree cart store instance (no global singleton)
  const cartStoreInstance = React.useRef<ReturnType<
    typeof createCartStoreZustand
  > | null>(null);

  if (!cartStoreInstance.current) {
    cartStoreInstance.current = createCartStoreZustand(initialCart);
  }

  // Convert serializable query to Relay PreloadedQuery
  const initialCartPreloadedQuery = preloadedCartQuery
    ? useSerializablePreloadedQuery(environment, preloadedCartQuery)
    : null;

  return (
    <RelayEnvironmentProvider environment={environment}>
      <ShopProvider config={shopConfig}>
        <SessionProvider preloadedSessionQuery={preloadedSessionQuery}>
          <CartProvider
            store={cartStoreInstance.current!}
            config={cartConfig}
            initialCartData={initialCartPreloadedQuery ?? undefined}
          >
            {children}
          </CartProvider>
        </SessionProvider>
      </ShopProvider>
    </RelayEnvironmentProvider>
  );
}
