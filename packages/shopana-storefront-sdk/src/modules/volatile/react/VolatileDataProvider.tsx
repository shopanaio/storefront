'use client';

import * as React from 'react';
import { useApolloClient } from '@apollo/client/react';
import { readStaticDocument } from '../../../static/manifest';
import { VolatileBatcher } from '../core/VolatileBatcher';

const VolatileDataContext = React.createContext<VolatileBatcher | null>(null);

export interface VolatileDataProviderProps {
  children: React.ReactNode;
  /**
   * Prices with the fast data: true for a static page of an image (its HTML changes only with
   * the image), false for one of the bucket (rendered again within minutes of a change) and
   * for a server render. By default what the static document says.
   */
  withPrice?: boolean;
}

/**
 * The fast data of the page (stock, promotions, the correction of prices and availability, the
 * viewer's loyalty): ids registered by `useVolatileCard` and `useVolatileVariant` are asked for
 * once a frame after hydration, again when the page is shown after 30 s, and the variant's
 * promotions at their `validUntil`. Under the Apollo client.
 */
export function VolatileDataProvider({
  children,
  withPrice,
}: VolatileDataProviderProps) {
  const client = useApolloClient();
  const [batcher] = React.useState(
    () =>
      new VolatileBatcher(client, {
        withPrice: withPrice ?? readStaticDocument()?.volatilePrices ?? false,
      })
  );
  React.useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') batcher.visible();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      batcher.dispose();
    };
  }, [batcher]);
  return (
    <VolatileDataContext.Provider value={batcher}>
      {children}
    </VolatileDataContext.Provider>
  );
}

/** The batcher of the page; null outside the provider (nothing is asked for). */
export function useVolatileBatcher(): VolatileBatcher | null {
  return React.useContext(VolatileDataContext);
}
