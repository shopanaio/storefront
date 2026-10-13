'use client';

import { useCallback } from 'react';
import type { SignUpInput } from '../../../core/types';
import type { AuthorizationOptions } from '../../../core/ApplicationAuthClient';
import { useSessionContext } from '../../context/SessionContext';
import { useAuthAction } from './useAuthAction';

export function useSignUp() {
  const { authClient } = useSessionContext();
  const action = useCallback(
    async (input: SignUpInput, options?: AuthorizationOptions) => {
      await authClient.signUpWithPassword(input);
      return authClient.authorize(options);
    },
    [authClient]
  );
  const { execute: signUp, ...state } = useAuthAction(action);
  return { signUp, ...state };
}

export default useSignUp;
