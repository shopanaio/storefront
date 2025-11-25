'use client';

import { graphql, useMutation } from 'react-relay/hooks';

/**
 * GraphQL mutation for resetting password with token
 */
const useResetPasswordMutation = graphql`
  mutation useResetPasswordMutation($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
      clientMutationId
      errors {
        message
      }
    }
  }
`;

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
  return useMutation(useResetPasswordMutation);
};

export default useResetPassword;
