
import { UseGetSessionDataProps, SessionData } from "./index";

export const useGetSessionDataShopana = (props: UseGetSessionDataProps): SessionData | null => {
  const { preloadedSessionQuery } = props;

  if (!preloadedSessionQuery?.response) {
    return null;
  }

  // For Shopana response structure may be different
  // Need to check how exactly the response looks
  const response = preloadedSessionQuery.response;

  // Assume that response has structure { data: { session: {...} } }
  // But this needs to be clarified with real data
  if (response && typeof response === 'object' && 'data' in response) {
    const data = (response as any).data;
    if (data?.session) {
      return {
        user: data.session.user,
        token: data.session.accessToken,
        expiresAt: data.session.expiresAt,
      };
    }
  }

  return null;
};
