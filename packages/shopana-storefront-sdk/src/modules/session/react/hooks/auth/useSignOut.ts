'use client';

import { useCallback } from 'react';
import { useSessionContext } from '../../context/SessionContext';
import { useAuthAction } from './useAuthAction';

export interface SignOutOptions {
  redirectTo?: string;
}

export function useSignOut() {
  const { authClient, store } = useSessionContext();
  const action = useCallback(
    async ({ redirectTo }: SignOutOptions = {}) => {
      try {
        await authClient.signOut();
      } finally {
        if (redirectTo) {
          window.location.replace(redirectTo);
        } else {
          store.getState().setSession(null);
        }
      }
    },
    [authClient, store]
  );
  const { execute: signOut, ...state } = useAuthAction(action);
  return { signOut, ...state };
}

export default useSignOut;
