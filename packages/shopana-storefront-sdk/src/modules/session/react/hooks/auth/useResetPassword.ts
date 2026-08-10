'use client';

import { useCallback } from 'react';
import type { ResetPasswordInput } from '../../../core/types';
import { useSessionContext } from '../../context/SessionContext';
import { useAuthAction } from './useAuthAction';

export function useResetPassword() {
  const { authClient } = useSessionContext();
  const action = useCallback(
    (input: ResetPasswordInput) => authClient.resetPassword(input),
    [authClient]
  );
  const { execute: resetPassword, ...state } = useAuthAction(action);
  return { resetPassword, ...state };
}

export default useResetPassword;
