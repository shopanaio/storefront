import App from "@src/components/App/App";
import { ResponsiveServerProvider } from "@src/providers/responsive-server-provider";
import { IntlProvider } from "@src/providers/intl-provider";
import { SessionServerProvider } from "@src/providers/session-server-provider";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <IntlProvider locale={locale}>
      <ResponsiveServerProvider>
        <SessionServerProvider>
          <App>{children}</App>
        </SessionServerProvider>
      </ResponsiveServerProvider>
    </IntlProvider>
  );
}
