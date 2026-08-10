'use client';

import { useCallback } from 'react';
import type { ForgotPasswordInput } from '../../../core/types';
import { useSessionContext } from '../../context/SessionContext';
import { useAuthAction } from './useAuthAction';

export function useForgotPassword() {
  const { authClient } = useSessionContext();
  const action = useCallback(
    (input: ForgotPasswordInput) => authClient.requestPasswordReset(input),
    [authClient]
  );
  const { execute: requestPasswordReset, ...state } = useAuthAction(action);
  return { requestPasswordReset, ...state };
}

export default useForgotPassword;
