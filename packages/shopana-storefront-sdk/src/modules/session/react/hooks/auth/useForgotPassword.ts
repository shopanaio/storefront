'use client';

import { graphql, useMutation } from 'react-relay/hooks';

/**
 * GraphQL mutation for requesting password recovery
 */
const useForgotPasswordMutation = graphql`
  mutation useForgotPasswordMutation($input: PasswordRecoveryInput!) {
    requestPasswordRecovery(input: $input) {
      success
      clientMutationId
      errors {
        message
      }
    }
  }
`;

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
  return useMutation(useForgotPasswordMutation);
};

export default useForgotPassword;
