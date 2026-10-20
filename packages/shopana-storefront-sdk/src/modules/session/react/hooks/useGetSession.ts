'use client';

import { useCallback } from 'react';
import { useSessionContext } from '../context/SessionContext';
import { useAuthAction } from './auth/useAuthAction';

/** The current session and a way to read it again from the session server. */
export function useGetSession() {
  const { sessionClient, useStore } = useSessionContext();
  const session = useStore((state) => state.session);
  const action = useCallback(() => sessionClient.load(), [sessionClient]);
  const { execute: refreshSession, ...state } = useAuthAction(action);
  return { session, refreshSession, ...state };
}

export default useGetSession;
