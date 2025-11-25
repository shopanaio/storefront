'use client';

import { useMutation } from 'react-relay/hooks';
import type { forgotPasswordMutation as ForgotPasswordMutationType } from '../../../core/graphql/mutations/__generated__/forgotPasswordMutation.graphql';
import { forgotPasswordMutation } from '../../../core/graphql/mutations/forgotPasswordMutation';

/**
 * Hook to request password recovery/reset
 *
 * @returns Relay mutation tuple [commit, isInFlight]
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
  return useMutation<ForgotPasswordMutationType>(forgotPasswordMutation);
};

export default useForgotPassword;
