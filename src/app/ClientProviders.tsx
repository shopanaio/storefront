'use client';

import React from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { ConcreteRequest } from 'relay-runtime/lib/util/RelayConcreteNode';
import { getCurrentEnvironment } from '@src/relay/Environment';
import { ShopProvider } from '@shopana/storefront-sdk/shop';
import { mockShopConfig } from '@shopana/storefront-sdk/shop/mockShopConfig';
import {
  CartProvider,
  createCartStoreZustand,
} from '@shopana/storefront-sdk/modules/cart/react';
import { cartConfig } from '@src/config/cart.config';
import useSerializablePreloadedQuery from '@src/relay/useSerializablePreloadedQuery';
import type { SerializablePreloadedQuery } from '@src/relay/loadSerializableQuery';
import type { loadCartQuery as LoadCartQueryType } from '@shopana/storefront-sdk/modules/cart/core/graphql/queries/__generated__/loadCartQuery.graphql';

interface ClientProvidersProps {
  children: React.ReactNode;
  preloadedCartQuery?: SerializablePreloadedQuery<
    ConcreteRequest,
    LoadCartQueryType
  > | null;
}

export function ClientProviders({
  children,
  preloadedCartQuery,
}: ClientProvidersProps) {
  // Extract initial cart entity from SSR preloaded query (server-rendered cart)
  const initialCart =
    preloadedCartQuery &&
    (preloadedCartQuery.response as any)?.data?.checkoutQuery?.checkout
      ? ((preloadedCartQuery.response as any).data.checkoutQuery
          .checkout as any)
      : null;

  // Create per-tree cart store instance, hydrated with initial cart (no global singleton)
  const cartStoreInstance = React.useRef<ReturnType<
    typeof createCartStoreZustand
  > | null>(null);

  if (!cartStoreInstance.current) {
    cartStoreInstance.current = createCartStoreZustand(initialCart);
  }

  const environment = getCurrentEnvironment();
  const initialCartPreloadedQuery = preloadedCartQuery
    ? useSerializablePreloadedQuery(environment, preloadedCartQuery)
    : null;

  return (
    <RelayEnvironmentProvider environment={environment}>
      <ShopProvider config={mockShopConfig}>
        <CartProvider
          store={cartStoreInstance.current!}
          config={cartConfig}
          initialCartData={initialCartPreloadedQuery ?? undefined}
        >
          {children}
        </CartProvider>
      </ShopProvider>
    </RelayEnvironmentProvider>
  );
}
