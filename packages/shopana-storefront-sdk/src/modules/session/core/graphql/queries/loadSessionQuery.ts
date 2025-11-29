import { graphql } from 'react-relay';

export const loadSessionQuery = graphql`
  query loadSessionQuery {
    session {
      user {
        id
        iid
        email
      }
      accessToken
    }
  }
`;
