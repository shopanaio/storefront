import { graphql, useMutation } from "react-relay/hooks";

const useResetPasswordMutation = graphql`
  mutation useResetPasswordMutation($id: ID!, $input: CustomerResetInput!) {
    customerReset(id: $id, input: $input) {
      customer {
        id
        email
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        message
        field
        code
      }
    }
  }
`;

const useResetPassword = () => {
  return useMutation(useResetPasswordMutation);
};

export default useResetPassword;