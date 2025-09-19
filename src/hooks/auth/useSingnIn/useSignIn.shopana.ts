import { graphql, useMutation } from "react-relay/hooks";

const useSignInMutation = graphql`
  mutation useSignInMutation($input: PasswordSignInInput!) {
    passwordSignIn(input: $input) {
      session {
        accessToken
        user {
          id
          iid
          email
        }
      }
      errors {
        message
      }
    }
  }
`;

const useSignIn = () => {
  return useMutation(useSignInMutation);
};

export default useSignIn;