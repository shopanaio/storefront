'use client';

import { useApolloClient } from '@apollo/client/react';
import { useEffect, useRef } from 'react';
import { mapPendingApolloResults } from '../graphql/apollo/cache';
import { useIsAuthenticated } from '../modules/session/react/context/SessionContext';
import { refetchViewerQueries, stripViewerFields } from './viewer';

/**
 * Asks the API again for the fields that depend on who looks (loyalty points by tier, votes
 * and subscriptions, saved comparisons) when the viewer changes: a static page is rendered for
 * a guest, and its buyer is known only once the browser has the session; signing in or out
 * changes it again. The queries on screen that show those fields are asked again; what they
 * show stays until the answers come. Under `SessionProvider`.
 */
export function useViewerRefresh(): void {
  const client = useApolloClient();
  const authenticated = useIsAuthenticated();
  const previous = useRef(authenticated);

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
