'use client';

import { useCallback } from 'react';
import type { ResetPasswordInput } from '../../../core/types';
import { useIamClient } from './useIamClient';
import { useAuthAction } from './useAuthAction';

export function useResetPassword() {
  const iamClient = useIamClient();
  const action = useCallback(
    (input: ResetPasswordInput) => iamClient.resetPassword(input),
    [iamClient]
  );
  const { execute: resetPassword, ...state } = useAuthAction(action);
  return { resetPassword, ...state };
}

export default useResetPassword;
