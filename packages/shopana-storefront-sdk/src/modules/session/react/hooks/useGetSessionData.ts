'use client';

import type { SerializableApolloQuery } from '../../../../graphql/apollo/loadSerializableQuery';
import type {
  SdkLoadSessionQuery,
  SdkLoadSessionQueryVariables,
} from '../../../../graphql/apollo/generated/operations';

export interface SessionData {
  user: SdkLoadSessionQuery['session'] extends infer T
    ? T extends { user: infer TUser }
      ? TUser
      : never
    : never;
  token: string | null;
}

export interface UseGetSessionDataProps {
  preloadedSessionQuery?: SerializableApolloQuery<
    SdkLoadSessionQuery,
    SdkLoadSessionQueryVariables
  >;
}

export const useGetSessionData = ({
  preloadedSessionQuery,
}: UseGetSessionDataProps): SessionData | null => {
  const session = preloadedSessionQuery?.data.session;
  return session
    ? { user: session.user, token: session.accessToken ?? null }
    : null;
};

export default useGetSessionData;
