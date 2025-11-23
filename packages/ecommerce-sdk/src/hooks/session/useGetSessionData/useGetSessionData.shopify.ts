
import { UseGetSessionDataProps, SessionData } from "./index";

export const useGetSessionDataShopify = (props: UseGetSessionDataProps): SessionData | null => {
  const { preloadedSessionQuery } = props;

  if (!preloadedSessionQuery?.response) {
    return null;
  }

  const response = preloadedSessionQuery.response;

  // For Shopify response structure may be different
  // Need to check how exactly the response looks
  if (response && typeof response === 'object' && 'data' in response) {
    const data = (response as any).data;
    if (data?.customer) {
      return {
        user: data.customer,
        token: preloadedSessionQuery.variables?.customerAccessToken || null,
        expiresAt: preloadedSessionQuery.expiresAt,
      };
    }
  }

  return null;
};
