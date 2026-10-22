'use client';

import { useEffect, useState } from 'react';
import { AuthError } from '../core/AuthError';
import type { AuthConfiguration } from '../core/types';
import { useHeadlessAuthClient } from './useHeadlessAuthClient';

export interface AuthConfigurationState {
  configuration: AuthConfiguration | null;
  isLoading: boolean;
  error: AuthError | null;
}

/** Sign-in methods the store has enabled, to decide which forms and fields to render. */
export function useAuthConfiguration(): AuthConfigurationState {
  const client = useHeadlessAuthClient();
  const [state, setState] = useState<AuthConfigurationState>({
    configuration: null,
    isLoading: true,
    error: null,
  });

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
  }, [client]);

  return state;
}
