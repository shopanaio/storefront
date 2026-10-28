'use client';

/**
 * What a theme's root layout (`src/runtime/layout.tsx`) renders with under React Router: the
 * document parts of React Router and the storefront providers fed by the root loader.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { useRouteLoaderData } from 'react-router';
import { AppProviders } from '@shopana/storefront-sdk/AppProviders';
import { createApolloClient } from '@shopana/storefront-sdk/graphql/apollo';
import type { ApolloEnvironmentConfig } from '@shopana/storefront-sdk/graphql/apollo/types';
import { peekApolloRequestClient } from '@shopana/storefront-sdk/server/requestClient';
import type { ServerAppProps } from '@shopana/storefront-sdk/server/app';
import type { RuntimeAppDefinition } from './app';
import type { RuntimeRootData } from './route-data';

export { Links, Meta, Scripts, ScrollRestoration } from 'react-router';

const RuntimeAppContext = createContext<RuntimeAppDefinition | null>(null);

/** Set by the generated root around the theme layout. */
export function RuntimeAppScope({
  app,
  children,
}: {
  app: RuntimeAppDefinition;
  children: ReactNode;
}) {
  return (
    <RuntimeAppContext.Provider value={app}>
      {children}
    </RuntimeAppContext.Provider>
  );
}

/** Store languages of the last root data, for the root route's revalidation. */
let knownLocaleSegments: readonly string[] = [];

export function getKnownLocaleSegments(): readonly string[] {
  return knownLocaleSegments;
}

function rememberLocaleSegments(segments: readonly string[]) {
  knownLocaleSegments = segments;
}

/**
 * The root data of the request (store, locale, languages, cart, session), or null when the
 * root loader failed and the root error boundary renders.
 */
export function useRuntimeApp(): ServerAppProps | null {
  const data = useRouteLoaderData('root') as RuntimeRootData | undefined;
  return data?.app ?? null;
}

function RuntimeApolloProvider({
  environmentConfig,
  app,
  children,
}: {
  environmentConfig: ApolloEnvironmentConfig;
  app: ServerAppProps;
  children: ReactNode;
}) {
  // The server render reads the request client of the loaders: their queries are in its
  // cache, and anything else it runs goes out with the request's session. The browser starts
  // from the snapshot of the root loader; each page adds its own.
  const [client] = useState(
    () =>
      peekApolloRequestClient(environmentConfig) ??
      createApolloClient(environmentConfig, {
        initialState: app.apolloInitialState,
        locale: app.locale.tag,
      })
  );
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

/**
 * The storefront providers (Apollo, store, localization, session, cart) of the root data. The
 * theme layout wraps its app in it; without root data (the root error page) it renders the
 * children alone. A new locale (a full page load) starts them anew.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const runtimeApp = useContext(RuntimeAppContext);
  const app = useRuntimeApp();
  const locales = app?.locales.locales;
  useEffect(() => {
    if (locales)
      rememberLocaleSegments(locales.map((locale) => locale.segment));
  }, [locales]);

  if (!runtimeApp) {
    throw new Error(
      'AppProvider renders inside the root layout of the runtime'
    );
  }
  if (!app) return <>{children}</>;

  const { apolloInitialState, ...props } = app;
  void apolloInitialState;

  return (
    <RuntimeApolloProvider
      key={app.locale.tag}
      environmentConfig={runtimeApp.environmentConfig}
      app={app}
    >
      <AppProviders
        {...props}
        environmentConfig={runtimeApp.environmentConfig}
        cartConfig={runtimeApp.cartConfig}
      >
        {children}
      </AppProviders>
    </RuntimeApolloProvider>
  );
}
