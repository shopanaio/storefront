'use client';

import { useMutation } from 'react-relay/hooks';
import type { resetPasswordMutation as ResetPasswordMutationType } from '../../../core/graphql/mutations/__generated__/resetPasswordMutation.graphql';
import { resetPasswordMutation } from '../../../core/graphql/mutations/resetPasswordMutation';

/**
 * Hook to reset password with recovery token
 *
 * @returns Relay mutation tuple [commit, isInFlight]
 *
 * @example
 * ```tsx
 * const [resetPassword, isLoading] = useResetPassword();
 *
 * const handleResetPassword = () => {
 *   resetPassword({
 *     variables: {
 *       input: {
 *         token: 'recovery-token',
 *         newPassword: 'newPassword123'
 *       }
 *     },
 *     onCompleted: (data) => {
 *       if (data.resetPassword.success) {
 *         // Password reset successful
 *       }
 *     }
 *   });
 * };
 * ```
 */
export const useResetPassword = () => {
  return useMutation<ResetPasswordMutationType>(resetPasswordMutation);
};

export default useResetPassword;
