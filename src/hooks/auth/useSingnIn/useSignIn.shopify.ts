import { graphql, useMutation } from "react-relay/hooks";

const useSignInMutation = graphql`
  mutation useSignInMutation($input: CustomerAccessTokenCreateInput!) {
  customerAccessTokenCreate(input: $input) {
        customerAccessToken {
            accessToken
        }
        customerUserErrors {
            code
            field
            message
        }
        userErrors {
            field
            message
        }
    }
}
  `;

const useSignIn = () => {
  return useMutation(useSignInMutation);
};

export default useSignIn;