'use client';
import { useMutation } from '../../../../../graphql/apollo/hooks/useMutation';
import { forgotPasswordMutation } from '../../../core/graphql/mutations/forgotPasswordMutation';
/**
 * Hook to request password recovery/reset
 *
 * @returns Mutation tuple [commit, isInFlight]
 *
 * @example
 * ```tsx
 * const [forgotPassword, isLoading] = useForgotPassword();
 *
 * const handleForgotPassword = () => {
 *   forgotPassword({
 *     variables: {
 *       input: { email: 'user@example.com' }
 *     },
 *     onCompleted: (data) => {
 *       if (data.requestPasswordRecovery.success) {
 *         // Recovery email sent
 *       }
 *     }
 *   });
 * };
 * ```
 */
export const useForgotPassword = () => {
  return useMutation(forgotPasswordMutation);
};
export default useForgotPassword;
