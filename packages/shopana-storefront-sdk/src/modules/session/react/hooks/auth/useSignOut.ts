'use client';

import { useCallback } from 'react';
import { useSessionContext } from '../../context/SessionContext';
import { useLocalization } from '../../../../localization/react/useLocalization';
import { useAuthAction } from './useAuthAction';

export interface SignOutOptions {
  /** Where to go after sign-out; the home page of the active locale by default. */
  redirectTo?: string;
}

/**
 * Ends the session on the session server (IAM session ended, session and cart cookies cleared,
 * S5), then leaves for `redirectTo`. The account cart stays with the account; this browser
 * continues as a guest with an empty cart.
 */
export function useSignOut() {
  const { sessionClient, cartCookieName } = useSessionContext();
  const { buildHref } = useLocalization();
  const action = useCallback(
    async ({ redirectTo = buildHref('/') }: SignOutOptions = {}) => {
      await sessionClient.signOut({ cartCookieName });
      // A full navigation drops the account data held by this page (Apollo cache, cart store).
      window.location.assign(redirectTo);
    },
    [sessionClient, cartCookieName, buildHref]
  );
  const { execute: signOut, ...state } = useAuthAction(action);
  return { signOut, ...state };
}

export default useSignOut;
