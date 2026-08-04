'use client';

import React from 'react';
import type { SerializableApolloQuery } from '../../../../graphql/apollo/loadSerializableQuery';
import type {
  SdkLoadSessionQuery,
  SdkLoadSessionQueryVariables,
} from '../../../../graphql/apollo/generated/operations';

export interface SessionProviderProps {
  children: React.ReactNode;
  preloadedSessionQuery?: SerializableApolloQuery<
    SdkLoadSessionQuery,
    SdkLoadSessionQueryVariables
  > | null;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
}) => <>{children}</>;

export default SessionProvider;
