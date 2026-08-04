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
import {
  SdkLoadCartQueryDocument,
  SdkLoadSessionQueryDocument,
} from './graphql/apollo/generated/operations';

interface AppProvidersProps {
  children: React.ReactNode;
  environmentConfig: ApolloEnvironmentConfig;
  apolloInitialState?: NormalizedCacheObject;
  shopConfig: ShopConfig;
  cartConfig: CartConfig;
  initialCartId?: string;
}

const HydratedAppProviders: React.FC<
  Omit<AppProvidersProps, 'environmentConfig' | 'apolloInitialState'>
> = ({ children, shopConfig, cartConfig, initialCartId }) => {
  const cartQuery = useQuery(SdkLoadCartQueryDocument, {
    variables: { checkoutId: initialCartId ?? '' },
    fetchPolicy: 'cache-only',
    skip: !initialCartId,
  });
  const sessionQuery = useQuery(SdkLoadSessionQueryDocument, {
    fetchPolicy: 'cache-only',
  });
  const initialCheckout = cartQuery.data?.checkout ?? null;
  const initialCart = initialCheckout
    ? mapShopanaCheckoutToEntityCart(initialCheckout)
    : null;
  const initialSession = sessionQuery.data?.session ?? null;
  const [cartStoreInstance] = React.useState(() =>
    createCartStoreZustand(initialCart)
  );
  const [sessionStoreInstance] = React.useState(() =>
    createSessionStoreZustand(
      initialSession
        ? {
            user: initialSession.user,
            token: initialSession.accessToken ?? undefined,
          }
        : null
    )
  );

  return (
    <ShopProvider config={shopConfig}>
      <SessionProvider store={sessionStoreInstance}>
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
      <HydratedAppProviders {...props} />
    </ApolloAppProvider>
  );
}
