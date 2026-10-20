'use client';

import { useCallback } from 'react';
import type { SignUpInput } from '../../../core/types';
import type { AuthorizationOptions } from '../../../core/StorefrontSessionClient';
import { useIamClient } from './useIamClient';
import { useSessionContext } from '../../context/SessionContext';
import { useAuthAction } from './useAuthAction';

/** Creates the IAM account with a password, then signs in through `/auth/login`. */
export function useSignUp() {
  const { sessionClient } = useSessionContext();
  const iamClient = useIamClient();
  const action = useCallback(
    async (input: SignUpInput, options?: AuthorizationOptions) => {
      await iamClient.signUpWithPassword(input);
      return sessionClient.authorize(options);
    },
    [iamClient, sessionClient]
  );
  const { execute: signUp, ...state } = useAuthAction(action);
  return { signUp, ...state };
}

export default useSignUp;
