'use client';

import React from 'react';
import type { NormalizedCacheObject } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
// Loaded before hydration so the app's popstate listener is added ahead of the router's.
import './routing/browserHistory';
import { CartProvider } from './modules/cart/react/providers/CartProvider';
import { AccountCartSync } from './modules/cart/react/providers/AccountCartSync';
import { createCartStoreZustand } from './modules/cart/react/store/CartStoreZustand';
import type { CartConfig } from './modules/cart/core/config';
import { mapShopanaCheckoutToEntityCart } from './modules/cart/core/mappers/mapShopanaToEntityCart';
import { SessionProvider } from './modules/session/react/context/SessionContext';
import { createSessionStoreZustand } from './modules/session/react/store/SessionStoreZustand';
import { ApolloAppProvider } from './next/apollo/ApolloProvider';
import type { ApolloEnvironmentConfig } from './graphql/apollo/types';
import {
  SdkLoadCartQueryDocument,
  type SdkStoreFragment,
} from './graphql/apollo/generated/operations';
import type { Session } from './modules/session/core/types';
import { LocalizationProvider } from './modules/localization/react/LocalizationContext';
import type { StorefrontLocale } from './modules/localization/core/locale';
import type {
  LocalePrefixMode,
  StorefrontLocales,
} from './modules/localization/core/types';
import { StoreProvider } from './modules/store/react/StoreContext';

interface AppProvidersProps {
  children: React.ReactNode;
  environmentConfig: ApolloEnvironmentConfig;
  apolloInitialState?: NormalizedCacheObject;
  store: SdkStoreFragment;
  locale: StorefrontLocale;
  locales: StorefrontLocales;
  localePrefix: LocalePrefixMode;
  cartConfig: CartConfig;
  initialCartId?: string;
  initialSession?: Session | null;
}

const HydratedAppProviders: React.FC<
  Omit<AppProvidersProps, 'apolloInitialState'>
> = ({
  children,
  environmentConfig,
  store,
  locale,
  locales,
  localePrefix,
  cartConfig,
  initialCartId,
  initialSession,
}) => {
  const cartQuery = useQuery(SdkLoadCartQueryDocument, {
    variables: { checkoutId: initialCartId ?? '' },
    fetchPolicy: 'cache-only',
    skip: !initialCartId,
  });
  const initialCheckout = cartQuery.data?.checkout ?? null;
  const initialCart = initialCheckout
    ? mapShopanaCheckoutToEntityCart(initialCheckout)
    : null;
  const [cartStoreInstance] = React.useState(() =>
    createCartStoreZustand(initialCart)
  );
  const [sessionStoreInstance] = React.useState(() =>
    createSessionStoreZustand(initialSession)
  );
  const cartLocalization = React.useMemo(
    () => ({
      languageCode: locale.code,
      currencyCode: store.defaultCurrency,
    }),
    [locale.code, store.defaultCurrency]
  );

  return (
    <StoreProvider store={store}>
      <LocalizationProvider
        locale={locale}
        locales={locales}
        localePrefix={localePrefix}
        currencyCode={store.defaultCurrency}
        timeZone={store.timezone}
      >
        <SessionProvider
          store={sessionStoreInstance}
          applicationAuth={environmentConfig.applicationAuth}
          cartCookieName={cartConfig.cookieName}
          cookiePolicy={environmentConfig.cookiePolicy}
        >
          <CartProvider
            store={cartStoreInstance}
            config={cartConfig}
            initialCart={initialCheckout}
            localization={cartLocalization}
          >
            {children}
            <AccountCartSync />
          </CartProvider>
        </SessionProvider>
      </LocalizationProvider>
    </StoreProvider>
  );
};

export type AppProps = AppProvidersProps;

export function App({ environmentConfig, apolloInitialState, ...props }: AppProps) {
  return (
    <ApolloAppProvider
      environmentConfig={environmentConfig}
      initialState={apolloInitialState}
      locale={props.locale.tag}
    >
      <HydratedAppProviders {...props} environmentConfig={environmentConfig} />
    </ApolloAppProvider>
  );
}
