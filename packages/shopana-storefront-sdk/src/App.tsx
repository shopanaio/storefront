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
import { SessionProvider } from './modules/session/react/context/SessionContext';
import { createSessionStoreZustand } from './modules/session/react/store/SessionStoreZustand';

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

/**
 * Internal providers wrapper that encapsulates all SDK providers
 * @internal
 */
interface AppProvidersProps {
  children: React.ReactNode;
  environment: Environment;
  shopConfig: ShopConfig;
  cartConfig: CartConfig;
  preloadedCartQuery?: SerializablePreloadedQuery<
    ConcreteRequest,
    LoadCartQueryType
  > | null;
  preloadedSessionQuery?: SerializablePreloadedQuery<
    ConcreteRequest,
    LoadSessionQueryType
  > | null;
}

const AppProviders: React.FC<AppProvidersProps> = ({
  children,
  environment,
  shopConfig,
  cartConfig,
  preloadedCartQuery,
  preloadedSessionQuery,
}) => {
  // Extract initial cart entity from SSR preloaded query (for store hydration)
  const initialCart =
    preloadedCartQuery &&
    (preloadedCartQuery.response as any)?.data?.checkoutQuery?.checkout
      ? ((preloadedCartQuery.response as any).data.checkoutQuery.checkout as any)
      : null;

  // Extract initial session from SSR preloaded query
  const initialSession =
    preloadedSessionQuery &&
    (preloadedSessionQuery.response as any)?.data?.session
      ? ((preloadedSessionQuery.response as any).data.session as any)
      : null;

  // Create per-tree cart store instance (no global singleton)
  const cartStoreInstance = React.useRef<ReturnType<
    typeof createCartStoreZustand
  > | null>(null);

  if (!cartStoreInstance.current) {
    cartStoreInstance.current = createCartStoreZustand(initialCart);
  }

  // Create per-tree session store instance (no global singleton)
  const sessionStoreInstance = React.useRef<ReturnType<
    typeof createSessionStoreZustand
  > | null>(null);

  if (!sessionStoreInstance.current) {
    sessionStoreInstance.current = createSessionStoreZustand(
      initialSession ? { user: initialSession.user, token: initialSession.accessToken } : null
    );
  }

  // Convert serializable query to Relay PreloadedQuery
  const initialCartPreloadedQuery = preloadedCartQuery
    ? useSerializablePreloadedQuery(environment, preloadedCartQuery)
    : null;

  return (
    <RelayEnvironmentProvider environment={environment}>
      <ShopProvider config={shopConfig}>
        <SessionProvider store={sessionStoreInstance.current!}>
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
};

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
 * - SessionProvider (session state management)
 * - CartProvider (cart state management)
 *
 * All providers are hidden inside and managed automatically.
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

  return (
    <AppProviders
      environment={environment}
      shopConfig={shopConfig}
      cartConfig={cartConfig}
      preloadedCartQuery={preloadedCartQuery}
      preloadedSessionQuery={preloadedSessionQuery}
    >
      {children}
    </AppProviders>
  );
}
