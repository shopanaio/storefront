import { UseInitialSessionStateProps } from "./index";
import type { Entity } from "@shopana/entity";

export const useInitialSessionStateShopana = (
  props: UseInitialSessionStateProps
): Entity.Session | undefined => {
  const { preloadedSessionQuery } = props;

  if (!preloadedSessionQuery?.response) {
    return undefined;
  }

  const sessionData = preloadedSessionQuery.response;

  if (!sessionData) {
    return undefined;
  }

  const response = preloadedSessionQuery.response as { data?: { session?: { user?: { id: string; email: string; firstName?: string; lastName?: string }; accessToken?: string; expiresAt?: string } } };
  const rawUser = response?.data?.session?.user;

  // Map raw user data to User interface
  const user: Entity.User | null = rawUser
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
