'use client';

import { useCallback } from 'react';
import type { ForgotPasswordInput } from '../../../core/types';
import { useIamClient } from './useIamClient';
import { useAuthAction } from './useAuthAction';

export function useForgotPassword() {
  const iamClient = useIamClient();
  const action = useCallback(
    (input: ForgotPasswordInput) => iamClient.requestPasswordReset(input),
    [iamClient]
  );
  const { execute: requestPasswordReset, ...state } = useAuthAction(action);
  return { requestPasswordReset, ...state };
}

export default useForgotPassword;
