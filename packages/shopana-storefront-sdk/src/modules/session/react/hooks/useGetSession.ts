'use client';

import { useCallback } from 'react';
import { useSessionContext } from '../context/SessionContext';
import { useAuthAction } from './auth/useAuthAction';

export function useGetSession() {
  const { authClient, store, useStore } = useSessionContext();
  const session = useStore((state) => state.session);
  const action = useCallback(async () => {
    const value =
      (await authClient.getSession()) ?? (await authClient.refresh());
    store.getState().setSession(value);
    return value;
  }, [authClient, store]);
  const { execute: refreshSession, ...state } = useAuthAction(action);
  return { session, refreshSession, ...state };
}

export default useGetSession;
