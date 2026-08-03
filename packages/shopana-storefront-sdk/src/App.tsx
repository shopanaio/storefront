'use client';

import React from 'react';
import type { NormalizedCacheObject } from '@apollo/client';
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
import { QueryProvider } from './next/relay/QueryProvider';
import { ApolloAppProvider } from './next/apollo/ApolloProvider';
import type { ApolloEnvironmentConfig } from './graphql/apollo/types';

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
  apolloEnvironmentConfig: ApolloEnvironmentConfig;
  apolloInitialState?: NormalizedCacheObject;
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
  apolloEnvironmentConfig,
  apolloInitialState,
  shopConfig,
  cartConfig,
  preloadedCartQuery,
  preloadedSessionQuery,
}) => {
  // Extract initial cart entity from SSR preloaded query (for store hydration)
  const initialCart =
    preloadedCartQuery &&
    (preloadedCartQuery.response as any)?.data?.checkoutQuery?.checkout
      ? ((preloadedCartQuery.response as any).data.checkoutQuery
          .checkout as any)
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
      initialSession
        ? { user: initialSession.user, token: initialSession.accessToken }
        : null
    );
  }

  // Convert serializable query to Relay PreloadedQuery
  const initialCartPreloadedQuery = preloadedCartQuery
    ? useSerializablePreloadedQuery(environment, preloadedCartQuery)
    : null;

  return (
    <ApolloAppProvider
      environmentConfig={apolloEnvironmentConfig}
      initialState={apolloInitialState}
    >
      <RelayEnvironmentProvider environment={environment}>
        <ShopProvider config={shopConfig}>
          <SessionProvider store={sessionStoreInstance.current!}>
            <CartProvider
              store={cartStoreInstance.current!}
              config={cartConfig}
              initialCartData={initialCartPreloadedQuery ?? undefined}
            >
              {preloadedSessionQuery ? (
                <QueryProvider preloadedQuery={preloadedSessionQuery}>
                  {children}
                </QueryProvider>
              ) : (
                children
              )}
            </CartProvider>
          </SessionProvider>
        </ShopProvider>
      </RelayEnvironmentProvider>
    </ApolloAppProvider>
  );
};

export interface AppProps {
  children: React.ReactNode;
  /**
   * Relay environment configuration
   */
  environmentConfig: RelayEnvironmentConfig;
  /**
   * Optional Apollo network configuration. Defaults to environmentConfig so
   * Relay and Apollo can use the same endpoint during incremental migration.
   */
  apolloEnvironmentConfig?: ApolloEnvironmentConfig;
  /** Optional normalized cache produced by an imperative Apollo SSR loader. */
  apolloInitialState?: NormalizedCacheObject;
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
 * - ApolloNextAppProvider (GraphQL, new UI)
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
  apolloEnvironmentConfig = environmentConfig,
  apolloInitialState,
  shopConfig,
  cartConfig,
  preloadedCartQuery,
  preloadedSessionQuery,
}: AppProps) {
  const environment = getOrCreateEnvironment(environmentConfig);

  return (
    <AppProviders
      environment={environment}
      apolloEnvironmentConfig={apolloEnvironmentConfig}
      apolloInitialState={apolloInitialState}
      shopConfig={shopConfig}
      cartConfig={cartConfig}
      preloadedCartQuery={preloadedCartQuery}
      preloadedSessionQuery={preloadedSessionQuery}
    >
      {children}
    </AppProviders>
  );
}
