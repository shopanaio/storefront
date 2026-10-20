'use client';

import { useCallback } from 'react';
import type { SignInInput } from '../../../core/types';
import type { AuthorizationOptions } from '../../../core/StorefrontSessionClient';
import { useIamClient } from './useIamClient';
import { useSessionContext } from '../../context/SessionContext';
import { useAuthAction } from './useAuthAction';

/** Signs in to IAM with a password, then completes the sign-in through `/auth/login`. */
export function useSignIn() {
  const { sessionClient } = useSessionContext();
  const iamClient = useIamClient();
  const action = useCallback(
    async (input: SignInInput, options?: AuthorizationOptions) => {
      await iamClient.signInWithPassword(input);
      return sessionClient.authorize(options);
    },
    [iamClient, sessionClient]
  );
  const { execute: signIn, ...state } = useAuthAction(action);
  return { signIn, ...state };
}

export default useSignIn;
