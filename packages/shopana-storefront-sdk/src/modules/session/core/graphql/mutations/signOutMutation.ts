import { graphql } from 'react-relay';

/**
 * GraphQL mutation for signing out
 */
export const signOutMutation = graphql`
  mutation signOutMutation {
    signOut
  }
`;
