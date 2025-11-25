import { UseInitialSessionStateProps } from "./index";
import type { model } from "@shopana/storefront-sdk/model/namespace";

export const useInitialSessionStateShopify = (
  props: UseInitialSessionStateProps
): model.Session | undefined => {
  const { preloadedSessionQuery } = props;

  if (!preloadedSessionQuery?.response) {
    return undefined;
  }

  const sessionData = preloadedSessionQuery.response;

  if (!sessionData) {
    return undefined;
  }

  const response = preloadedSessionQuery.response as { data?: { customer?: { id: string; email: string; firstName?: string; lastName?: string } } };
  const rawCustomer = response?.data?.customer;

  // Map raw customer data to User interface
  const user: model.User | null = rawCustomer
    ? {
        id: rawCustomer.id,
        email: rawCustomer.email,
        firstName: rawCustomer.firstName || undefined,
        lastName: rawCustomer.lastName || undefined,
      }
    : null;

    const variables = preloadedSessionQuery.variables as { customerAccessToken?: string; expiresAt?: string };

    return {
      session: {
        user,
        token: variables?.customerAccessToken || undefined,
        expiresAt: variables?.expiresAt || undefined,
      },
    };
};
