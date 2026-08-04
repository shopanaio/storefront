'use client';
import { useMutation } from '../../../../../graphql/apollo/hooks/useMutation';
import { resetPasswordMutation } from '../../../core/graphql/mutations/resetPasswordMutation';
/**
 * Hook to reset password with recovery token
 *
 * @returns Mutation tuple [commit, isInFlight]
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
  return useMutation(resetPasswordMutation);
};
export default useResetPassword;
