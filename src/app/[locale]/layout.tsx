import { Theme } from '@src/ui-kit/Theme/Theme';
import ConfirmPortalHost from '@src/ui-kit/Confirm/ConfirmPortalHost';
import { WishlistProvider } from '@src/modules/wishlist';
import { ResponsiveServerProvider } from '@src/ui-kit/UserAgent';
import { IntlProvider } from '@src/i18n/Provider';

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
