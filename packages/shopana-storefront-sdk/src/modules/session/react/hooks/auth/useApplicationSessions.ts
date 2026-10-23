'use client';

import { useCallback, useState } from 'react';
import type { ApplicationSession } from '../../../core/IamApplicationClient';
import { useSessionContext } from '../../context/SessionContext';
import { useIamClient } from './useIamClient';
import { useAuthAction } from './useAuthAction';

export function useApplicationSessions() {
  const { sessionClient } = useSessionContext();
  const iamClient = useIamClient();
  const [sessions, setSessions] = useState<readonly ApplicationSession[]>([]);
  const loadAction = useCallback(async () => {
    const value = await iamClient.listSessions();
    setSessions(value);
    return value;
  }, [iamClient]);
  const revokeAction = useCallback(
    async (token: string) => {
      const revoked = await iamClient.revokeSession(token);
      if (revoked) {
        setSessions((value) =>
          value.filter((session) => session.token !== token)
        );
        // Revoking the current IAM session ends this storefront session too; the session
        // server finds out on refresh and the session store follows.
        await sessionClient.refresh().catch(() => undefined);
      }
      return revoked;
    },
    [iamClient, sessionClient]
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
