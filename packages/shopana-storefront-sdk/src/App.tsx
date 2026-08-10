'use client';

import React from 'react';
import type { NormalizedCacheObject } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { ShopProvider } from './shop/ShopContext';
import type { ShopConfig } from './shop/types';
import { CartProvider } from './modules/cart/react/providers/CartProvider';
import { createCartStoreZustand } from './modules/cart/react/store/CartStoreZustand';
import type { CartConfig } from './modules/cart/core/config';
import { mapShopanaCheckoutToEntityCart } from './modules/cart/core/mappers/mapShopanaToEntityCart';
import { SessionProvider } from './modules/session/react/context/SessionContext';
import { createSessionStoreZustand } from './modules/session/react/store/SessionStoreZustand';
import { ApolloAppProvider } from './next/apollo/ApolloProvider';
import type { ApolloEnvironmentConfig } from './graphql/apollo/types';
import { SdkLoadCartQueryDocument } from './graphql/apollo/generated/operations';
import type { Session } from './modules/session/core/types';

interface AppProvidersProps {
  children: React.ReactNode;
  environmentConfig: ApolloEnvironmentConfig;
  apolloInitialState?: NormalizedCacheObject;
  shopConfig: ShopConfig;
  cartConfig: CartConfig;
  initialCartId?: string;
  initialSession?: Session | null;
}

const HydratedAppProviders: React.FC<
  Omit<AppProvidersProps, 'apolloInitialState'>
> = ({
  children,
  environmentConfig,
  shopConfig,
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

  return (
    <ShopProvider config={shopConfig}>
      <SessionProvider
        store={sessionStoreInstance}
        authConfig={environmentConfig.applicationAuth}
      >
        <CartProvider
          store={cartStoreInstance}
          config={cartConfig}
          initialCart={initialCheckout}
        >
          {children}
        </CartProvider>
      </SessionProvider>
    </ShopProvider>
  );
};

export interface AppProps extends Omit<AppProvidersProps, 'environmentConfig'> {
  environmentConfig: ApolloEnvironmentConfig;
}

export function App({
  environmentConfig,
  apolloInitialState,
  ...props
}: AppProps) {
  return (
    <ApolloAppProvider
      environmentConfig={environmentConfig}
      initialState={apolloInitialState}
    >
      <HydratedAppProviders {...props} environmentConfig={environmentConfig} />
    </ApolloAppProvider>
  );
}
