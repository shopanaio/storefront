'use client';

import { useCallback } from 'react';
import type { AuthorizationOptions } from '../../../core/StorefrontSessionClient';
import { useSessionContext } from '../../context/SessionContext';
import { useAuthAction } from './useAuthAction';

/** Starts the IAM-hosted sign-in through the storefront session server (`/auth/login`). */
export function useOAuthAuthorization() {
  const { sessionClient } = useSessionContext();
  const action = useCallback(
    (options?: AuthorizationOptions) => sessionClient.authorize(options),
    [sessionClient]
  );
  const { execute: authorize, ...state } = useAuthAction(action);
  return { authorize, ...state };
}
