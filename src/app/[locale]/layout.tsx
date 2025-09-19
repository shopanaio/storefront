import { hasLocale } from "next-intl";
import { routing } from "@src/i18n/routing";
import App from "@src/components/App/App";
import { headers } from "next/headers";
import loadSerializableQuery from "@src/relay/loadSerializableQuery";
import useGetSessionQuery from "@src/hooks/session/useGetSession/__generated__/useGetSessionQuery.graphql";
import { ResponsiveProvider } from "@src/providers/responsive-provider";
import { parseUserAgent } from "@src/utils/parseUserAgent";
import accessTokenUtils from "@src/utils/accessToken";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    // redirect(`/${routing.defaultLocale}`);
  }

  const cookie = headers().get("cookie") ?? undefined;
  console.log("cookie", cookie);
  const userAgent = headers().get("user-agent") ?? "";

  const { isMobile, isDesktop } = parseUserAgent(userAgent);

  let preloadedSessionQuery;
  const customerAccessToken = accessTokenUtils.getAccessTokenFromCookie(cookie);

  console.log("customerAccessToken", customerAccessToken);

  if (customerAccessToken) {
    preloadedSessionQuery = await loadSerializableQuery(
      useGetSessionQuery.params,
      { customerAccessToken },
      cookie
    );
  }

  console.log("preloadedSessionQuery", preloadedSessionQuery);

  return (
    <ResponsiveProvider isMobile={isMobile} isDesktop={isDesktop}>
      <App locale={locale} preloadedSessionQuery={preloadedSessionQuery}>
        {children}
      </App>
    </ResponsiveProvider>
  );
}
