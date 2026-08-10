'use client';

import { useCallback, useState } from 'react';
import type { ApplicationSession } from '../../../core/ApplicationAuthClient';
import { useSessionContext } from '../../context/SessionContext';
import { useAuthAction } from './useAuthAction';

export function useApplicationSessions() {
  const { authClient, store } = useSessionContext();
  const [sessions, setSessions] = useState<readonly ApplicationSession[]>([]);
  const loadAction = useCallback(async () => {
    const value = await authClient.listSessions();
    setSessions(value);
    return value;
  }, [authClient]);
  const revokeAction = useCallback(
    async (token: string) => {
      const revoked = await authClient.revokeSession(token);
      if (revoked)
        setSessions((value) =>
          value.filter((session) => session.token !== token)
        );
      if (revoked) {
        try {
          const currentSession = await authClient.getSession();
          if (!currentSession) {
            authClient.clearTokens();
            store.getState().setSession(null);
          }
        } catch {
          // Revocation succeeded; retain local state on an unrelated network error.
        }
      }
      return revoked;
    },
    [authClient, store]
  );
  const load = useAuthAction(loadAction);
  const revoke = useAuthAction(revokeAction);
  return {
    sessions,
    loadSessions: load.execute,
    revokeSession: revoke.execute,
    isPending: load.isPending || revoke.isPending,
    error: load.error ?? revoke.error,
  };
}
