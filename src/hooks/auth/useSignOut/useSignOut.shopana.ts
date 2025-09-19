
import { graphql, useMutation } from "react-relay/hooks";

const useSignOutMutation = graphql`
  mutation useSignOutMutation {
    signOut
  }
`;

const useSignOut = () => {
  return useMutation(useSignOutMutation);
};

export default useSignOut;