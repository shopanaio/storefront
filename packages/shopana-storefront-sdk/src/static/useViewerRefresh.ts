'use client';

import { useApolloClient } from '@apollo/client/react';
import { useEffect, useRef } from 'react';
import { mapPendingApolloResults } from '../graphql/apollo/cache';
import { useIsAuthenticated } from '../modules/session/react/context/SessionContext';
import { useVolatileBatcher } from '../modules/volatile/react/VolatileDataProvider';
import { refetchViewerQueries, stripViewerFields } from './viewer';

/**
 * Asks the API again for the fields that depend on who looks when the viewer changes: a static
 * page is rendered for a guest, and its buyer is known only once the browser has the session;
 * signing in or out changes it again. Loyalty points by tier come with the viewer's batch of
 * the fast data (`VolatileDataProvider`) for the ids on screen; the small queries on screen
 * that show votes, subscriptions or saved comparisons are asked again. A query that shows only
 * loyalty (the page of a product) is not. Under `SessionProvider` and `VolatileDataProvider`.
 */
export function useViewerRefresh(): void {
  const client = useApolloClient();
  const authenticated = useIsAuthenticated();
  const batcher = useVolatileBatcher();
  const previous = useRef(authenticated);

  useEffect(() => {
    batcher?.setViewer(authenticated);
  }, [authenticated, batcher]);

  useEffect(() => {
    if (previous.current === authenticated) return;
    previous.current = authenticated;
    // Responses the cache has not written yet are the guest's too.
    mapPendingApolloResults(
      client.cache,
      (result) => stripViewerFields([result])[0]
    );
    void refetchViewerQueries(client);
  }, [authenticated, client]);
}

/** `useViewerRefresh` as an element, for a provider tree. */
export function ViewerRefresh(): null {
  useViewerRefresh();
  return null;
}
