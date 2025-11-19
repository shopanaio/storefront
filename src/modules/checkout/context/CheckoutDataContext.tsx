'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  Suspense,
} from 'react';
import {
  PreloadedQuery,
  useFragment,
  usePreloadedQuery,
  useQueryLoader,
} from 'react-relay';
import type { Checkout } from '@src/modules/checkout/types/entity';
import { useCheckoutFragment } from '@src/modules/checkout/hooks/useCheckout/useCheckoutFragment';
import { mapApiCheckoutToCheckout } from '@src/modules/checkout/hooks/useCheckout/mapApiCheckoutToCheckout';
import { useCheckoutFragment$key } from '@src/modules/checkout/hooks/useCheckout/__generated__/useCheckoutFragment.graphql';
import type { Entity } from '@shopana/entity';
import type { ApiCheckout } from '@codegen/schema-client';
import { loadCheckoutQuery } from '@src/modules/checkout/api/queries/loadCheckoutQuery.shopana';
import { loadCheckoutQuery as LoadCheckoutQueryType } from '@src/modules/checkout/api/queries/__generated__/loadCheckoutQuery.graphql';

export interface CheckoutDataContextValue {
  checkout: Checkout.Checkout | null;
  /** @deprecated Use `checkout` instead */
  cart: Checkout.Checkout | null;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
}

interface CheckoutDataInternalContextValue {
  checkoutKey: useCheckoutFragment$key | null;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
  queryReference: PreloadedQuery<LoadCheckoutQueryType> | null | undefined;
}

const CheckoutDataContext = createContext<
  CheckoutDataInternalContextValue | undefined
>(undefined);

type LoadCheckoutQueryReference = PreloadedQuery<LoadCheckoutQueryType>;

const CheckoutDataHandler: React.FC<{
  queryReference: LoadCheckoutQueryReference;
  onCheckoutData: (checkout: useCheckoutFragment$key) => void;
  onCheckoutNotFound: () => void;
}> = ({ queryReference, onCheckoutData, onCheckoutNotFound }) => {
  const data = usePreloadedQuery<LoadCheckoutQueryType>(
    loadCheckoutQuery,
    queryReference
  );

  useEffect(() => {
    const apiCheckout = data?.checkoutQuery?.checkout;

    if (apiCheckout) {
      onCheckoutData(apiCheckout);
    } else {
      console.error('Checkout not found');
      onCheckoutNotFound();
    }
  }, [data, onCheckoutData, onCheckoutNotFound]);

  return null;
};

export const CheckoutDataContextProvider: React.FC<{
  children: React.ReactNode;
  checkoutId: string | null;
}> = ({ children, checkoutId }) => {
  const [queryReference, loadQuery, disposeQuery] =
    useQueryLoader<LoadCheckoutQueryType>(loadCheckoutQuery);
  const [checkoutKey, setCheckoutKey] =
    useState<useCheckoutFragment$key | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isCheckoutLoaded, setIsCheckoutLoaded] = useState(false);

  useEffect(() => {
    if (!checkoutId) {
      setIsCheckoutLoading(false);
      setIsCheckoutLoaded(true);
      setCheckoutKey(null);
      return;
    }

    setIsCheckoutLoading(true);
    setIsCheckoutLoaded(false);

    loadQuery(
      { checkoutId: checkoutId },
      {
        fetchPolicy: 'network-only',
        networkCacheConfig: { force: true },
      }
    );

    return () => {
      disposeQuery();
    };
  }, [loadQuery, disposeQuery, checkoutId]);

  const handleCheckoutData = useCallback(
    (checkoutData: useCheckoutFragment$key) => {
      setCheckoutKey(checkoutData);
      setIsCheckoutLoaded(true);
      setIsCheckoutLoading(false);
    },
    []
  );

  const handleCheckoutNotFound = useCallback(() => {
    setIsCheckoutLoading(false);
    setCheckoutKey(null);
    setIsCheckoutLoaded(true);
  }, []);

  return (
    <CheckoutDataContext.Provider
      value={{
        checkoutKey,
        loading: isCheckoutLoading,
        loaded: isCheckoutLoaded,
        error: null,
        queryReference: queryReference || null,
      }}
    >
      <Suspense fallback={null}>
        {queryReference ? (
          <CheckoutDataHandler
            queryReference={queryReference}
            onCheckoutData={handleCheckoutData}
            onCheckoutNotFound={handleCheckoutNotFound}
          />
        ) : null}
      </Suspense>
      {children}
    </CheckoutDataContext.Provider>
  );
};

export function useCheckoutData(): CheckoutDataContextValue {
  const context = useContext(CheckoutDataContext);
  if (!context) {
    throw new Error('useCheckoutData must be used within CheckoutDataProvider');
  }

  const checkoutFragment = useFragment(
    useCheckoutFragment,
    context.checkoutKey
  );

  const checkout = useMemo(() => {
    if (!checkoutFragment) {
      return null;
    }
    return mapApiCheckoutToCheckout(
      checkoutFragment as unknown as Readonly<ApiCheckout>
    );
  }, [checkoutFragment]);

  return {
    checkout,
    cart: checkout,
    loading: context.loading,
    loaded: context.loaded,
    error: context.error,
  };
}
