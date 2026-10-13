'use client';

import { useCallback } from 'react';
import type { AuthorizationOptions } from '../../../core/ApplicationAuthClient';
import { useSessionContext } from '../../context/SessionContext';
import { useAuthAction } from './useAuthAction';

/** Starts the IAM-hosted OAuth authorization flow without collecting credentials in the storefront. */
export function useOAuthAuthorization() {
  const { authClient } = useSessionContext();
  const action = useCallback(
    (options?: AuthorizationOptions) => authClient.authorize(options),
    [authClient]
  );
  const { execute: authorize, ...state } = useAuthAction(action);
  return { authorize, ...state };
}
