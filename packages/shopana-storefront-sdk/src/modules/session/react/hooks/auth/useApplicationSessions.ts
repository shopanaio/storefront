'use client';

import { useCallback, useState } from 'react';
import type { ApplicationSession } from '../../../core/ApplicationAuthClient';
import { useSessionContext } from '../../context/SessionContext';
import { useAuthAction } from './useAuthAction';

export function useApplicationSessions() {
  const { authClient } = useSessionContext();
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
      return revoked;
    },
    [authClient]
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
