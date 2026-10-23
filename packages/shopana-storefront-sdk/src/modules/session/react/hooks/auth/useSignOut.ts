'use client';

import { useCallback } from 'react';
import { useSessionContext } from '../../context/SessionContext';
import { useAuthAction } from './useAuthAction';

export interface SignOutOptions {
  /** Where to go when IAM sign-out is not configured; the home page by default. */
  redirectTo?: string;
}

/**
 * Ends the session on the session server (tokens revoked, session and cart cookies cleared,
 * S5), then leaves for IAM end-session when it is configured. The account cart stays with the
 * account; this browser continues as a guest with an empty cart.
 */
export function useSignOut() {
  const { sessionClient, cartCookieName } = useSessionContext();
  const action = useCallback(
    async ({ redirectTo = '/' }: SignOutOptions = {}) => {
      const endSessionUrl = await sessionClient.signOut({ cartCookieName });
      // A full navigation drops the account data held by this page (Apollo cache, cart store).
      window.location.assign(endSessionUrl ?? redirectTo);
    },
    [sessionClient, cartCookieName]
  );
  const { execute: signOut, ...state } = useAuthAction(action);
  return { signOut, ...state };
}

export default useSignOut;
