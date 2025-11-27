import Cookies from "js-cookie";

const getAccessTokenFromCookie = (serverCookies?: string): string | null => {
  if (typeof window === "undefined") {
    if (serverCookies) {
      const match = serverCookies.match(/(?:^|; )accessToken=([^;]*)/);
      return match ? decodeURIComponent(match[1]) : null;
    }
    return null;
  } else {
    return Cookies.get("accessToken") ?? null;
  }
};

const setAccessTokenCookie = (
  token: string,
  options: {
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
    maxAge?: number;
  } = {}
): void => {
  const {
    secure = true,
    sameSite = "strict",
    maxAge = 3600 * 24 * 7, // default 7 days in seconds
  } = options;

  const expiresInDays = maxAge / (3600 * 24); // convert seconds → days

  Cookies.set("accessToken", token, {
    path: "/",
    secure,
    sameSite,
    expires: expiresInDays,
  });
};

const removeAccessTokenCookie = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  Cookies.remove("accessToken");
};

const accessTokenUtils = {
  getAccessTokenFromCookie,
  setAccessTokenCookie,
  removeAccessTokenCookie,
};

export default accessTokenUtils;
export { getAccessTokenFromCookie, setAccessTokenCookie, removeAccessTokenCookie };
