'use client';

import type { SerializableApolloQuery } from '../../../../graphql/apollo/loadSerializableQuery';
import type {
  SdkLoadSessionQuery,
  SdkLoadSessionQueryVariables,
} from '../../../../graphql/apollo/generated/operations';
import type { Session } from '../../core/types';

export interface UseInitialSessionStateProps {
  preloadedSessionQuery?: SerializableApolloQuery<
    SdkLoadSessionQuery,
    SdkLoadSessionQueryVariables
  >;
}

export interface InitialSessionState {
  session: Session | null;
}

export const useInitialSessionState = ({
  preloadedSessionQuery,
}: UseInitialSessionStateProps): InitialSessionState => {
  const session = preloadedSessionQuery?.data.session;
  return {
    session: session
      ? { user: session.user, token: session.accessToken ?? undefined }
      : null,
  };
};

export default useInitialSessionState;
