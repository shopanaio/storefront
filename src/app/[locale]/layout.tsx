import { Theme } from '@src/components/Theme/Theme';
import ConfirmPortalHost from '@src/components/UI/Confirm/ConfirmPortalHost';
import { WishlistProvider } from '@src/modules/wishlist';
import { ResponsiveServerProvider } from '@src/providers/responsive-server-provider';
import { IntlProvider } from '@src/providers/intl-provider';

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
        <WishlistProvider>
          <Theme>
            {children}
            <ConfirmPortalHost />
          </Theme>
        </WishlistProvider>
      </ResponsiveServerProvider>
    </IntlProvider>
  );
}
