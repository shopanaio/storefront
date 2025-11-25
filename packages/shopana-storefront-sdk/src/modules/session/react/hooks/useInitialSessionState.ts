'use client';

import type { SerializablePreloadedQuery } from '../../../../graphql/relay/loadSerializableQuery';
import { ConcreteRequest, OperationType } from 'relay-runtime';
import type { Session } from '../../core/types';
import type { model } from '../../../../model/namespace';

/**
 * Interface for input props
 */
export interface UseInitialSessionStateProps {
  preloadedSessionQuery?: SerializablePreloadedQuery<
    ConcreteRequest,
    OperationType
  >;
}

/**
 * Interface for return value
 */
export interface InitialSessionState {
  session: Session | null;
}

/**
 * Hook to extract initial session state from preloaded query
 * Used to initialize session store on app start
 *
 * @param props - Input props with preloaded query
 * @returns Initial session state
 *
 * @example
 * ```tsx
 * const initialState = useInitialSessionState({ preloadedSessionQuery });
 * ```
 */
export const useInitialSessionState = (
  props: UseInitialSessionStateProps
): InitialSessionState => {
  const { preloadedSessionQuery } = props;

  if (!preloadedSessionQuery?.response) {
    return { session: null };
  }

  const response = preloadedSessionQuery.response as {
    data?: {
      session?: {
        user?: {
          id: string;
          email: string;
          firstName?: string;
          lastName?: string;
        };
        accessToken?: string;
        expiresAt?: string;
      };
    };
  };

  const rawUser = response?.data?.session?.user;

  // Map raw user data to User interface
  const user: model.User | null = rawUser
    ? {
        id: rawUser.id,
        email: rawUser.email,
        firstName: rawUser.firstName || undefined,
        lastName: rawUser.lastName || undefined,
      }
    : null;

  return {
    session: {
      user,
      token: response?.data?.session?.accessToken || undefined,
      expiresAt: response?.data?.session?.expiresAt || undefined,
    },
  };
};

export default useInitialSessionState;
