'use client';

import { useCallback, useEffect, useState } from 'react';
import { AuthError } from '../core/AuthError';
import { clearConnectionResult, readConnectionResult } from '../core/links';
import type { AccountConnections, ConnectionResult } from '../core/types';
import { useHeadlessAuthClient } from './useHeadlessAuthClient';

export interface UseAccountConnectionsResult {
  /** Connections are loading, ready, or could not be read (see `error`). */
  status: 'loading' | 'ready' | 'unavailable';
  connections: AccountConnections | null;
  /**
   * Outcome of connecting a provider when the page is the one the browser returned to; it is
   * removed from the address bar once read.
   */
  result: ConnectionResult | null;
  isPending: boolean;
  /** Error of the last action; `reauthenticationRequired` asks the buyer to sign in again. */
  error: AuthError | null;
  /** Leaves for the provider; the browser returns to `returnTo` (the current page). */
  link(provider: string, options?: { returnTo?: string }): Promise<void>;
  unlink(provider: string): Promise<void>;
  reload(): Promise<void>;
}

/**
 * Social accounts of the signed-in buyer for an account page, like the IAM hosted connections
 * page. Needs the SDK `SessionProvider` and a signed-in buyer.
 */
export function useAccountConnections(): UseAccountConnectionsResult {
  const client = useHeadlessAuthClient();
  const [connections, setConnections] = useState<AccountConnections | null>(
    null
  );
  const [status, setStatus] =
    useState<UseAccountConnectionsResult['status']>('loading');
  const [result, setResult] = useState<ConnectionResult | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const reload = useCallback(async () => {
    try {
      setConnections(await client.connections());
      setStatus('ready');
    } catch (value) {
      setError(toAuthError(value));
      setStatus('unavailable');
    }
  }, [client]);

  useEffect(() => {
    const returned = readConnectionResult();
    if (returned) {
      setResult(returned);
      clearConnectionResult();
    }
    void reload();
  }, [reload]);

  // Linking leaves the page pending; back from the provider it may come from the bfcache.
  useEffect(() => {
    const restored = (event: PageTransitionEvent) => {
      if (event.persisted) setIsPending(false);
    };
    window.addEventListener('pageshow', restored);
    return () => window.removeEventListener('pageshow', restored);
  }, []);

  const link = useCallback(
    async (provider: string, options: { returnTo?: string } = {}) => {
      setIsPending(true);
      setError(null);
      try {
        await client.linkConnection({ provider, ...options });
      } catch (value) {
        setError(toAuthError(value));
        setIsPending(false);
      }
    },
    [client]
  );

  const unlink = useCallback(
    async (provider: string) => {
      setIsPending(true);
      setError(null);
      try {
        setConnections(await client.unlinkConnection({ provider }));
      } catch (value) {
        setError(toAuthError(value));
      } finally {
        setIsPending(false);
      }
    },
    [client]
  );

  return {
    status,
    connections,
    result,
    isPending,
    error,
    link,
    unlink,
    reload,
  };
}

function toAuthError(value: unknown): AuthError {
  return value instanceof AuthError
    ? value
    : new AuthError('unavailable', String(value), 0);
}
