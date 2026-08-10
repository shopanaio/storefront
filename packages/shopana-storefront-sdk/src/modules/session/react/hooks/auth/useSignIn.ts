'use client';

import { useCallback } from 'react';
import type { SignInInput } from '../../../core/types';
import type { AuthorizationOptions } from '../../../core/ApplicationAuthClient';
import { useSessionContext } from '../../context/SessionContext';
import { useAuthAction } from './useAuthAction';

export function useSignIn() {
  const { authClient } = useSessionContext();
  const action = useCallback(
    async (input: SignInInput, options?: AuthorizationOptions) => {
      await authClient.signInWithPassword(input);
      return authClient.authorize(options);
    },
    [authClient]
  );
  const { execute: signIn, ...state } = useAuthAction(action);
  return { signIn, ...state };
}

export default useSignIn;
