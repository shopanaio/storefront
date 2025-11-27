import React from 'react';
import { AppProvider } from '@shopana/storefront-sdk/AppProvider';
import { mockShopConfig } from '@shopana/storefront-sdk/shop/mockShopConfig';
import { environmentConfig } from '@src/config/environment.config';
import { cartConfig } from '@src/config/cart.config';
import { Theme } from '@src/ui-kit/Theme/Theme';
import ConfirmPortalHost from '@src/ui-kit/Confirm/ConfirmPortalHost';
import { WishlistProvider } from '@src/modules/wishlist';
import { ResponsiveServerProvider } from '@src/ui-kit/UserAgent/ResponsiveServerProvider';
import { IntlProvider } from '@src/i18n/Provider';

console.error = () => {};
console.warn = () => {};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Shopana</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no viewport-fit=cover"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <div id="app">
          <AppProvider
            environmentConfig={environmentConfig}
            shopConfig={mockShopConfig}
            cartConfig={cartConfig}
          >
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
          </AppProvider>
        </div>
        <div id="sheet-wrapper" />
      </body>
    </html>
  );
}
