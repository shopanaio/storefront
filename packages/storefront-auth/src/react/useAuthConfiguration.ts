'use client';

import { useCallback, useEffect, useState } from 'react';
import { AuthError } from '../core/AuthError';
import type { AuthConfiguration } from '../core/types';
import { useHeadlessAuthClient } from './useHeadlessAuthClient';

export interface AuthConfigurationState {
  configuration: AuthConfiguration | null;
  isLoading: boolean;
  error: AuthError | null;
  /** Reads the configuration again, e.g. from the retry of an `unavailable` alert. */
  reload: () => void;
}

type Loaded = Omit<AuthConfigurationState, 'reload'>;

const LOADING: Loaded = { configuration: null, isLoading: true, error: null };

/** Sign-in methods the store has enabled, to decide which forms and fields to render. */
export function useAuthConfiguration(): AuthConfigurationState {
  const client = useHeadlessAuthClient();
  const [state, setState] = useState<Loaded>(LOADING);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    client.configuration().then(
      (configuration) => {
        if (active) setState({ configuration, isLoading: false, error: null });
      },
      (error: unknown) => {
        if (!active) return;
        setState({
          configuration: null,
          isLoading: false,
          error:
            error instanceof AuthError
              ? error
              : new AuthError('unavailable', String(error), 0),
        });
      }
    );
    return () => {
      active = false;
    };
  }, [client, attempt]);

  // A failed read is not cached by the client, so the next one asks the server again.
  const reload = useCallback(() => {
    setState(LOADING);
    setAttempt((value) => value + 1);
  }, []);

  return { ...state, reload };
}
