'use client';

import { getCurrentEnvironment } from '@src/relay/Environment';
import { RelayEnvironmentProvider } from 'react-relay';
import { ShopProvider } from '@shopana/next-ecommerce-core/shop';
import { mockShopConfig } from '@shopana/next-ecommerce-core/shop/mockShopConfig';

console.error = () => {};
console.warn = () => {};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        {/* <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" /> */}
      </head>
      <RelayEnvironmentProvider environment={getCurrentEnvironment()}>
        <ShopProvider config={mockShopConfig}>
          <body>
            <div id="app">{children}</div>
            <div id="sheet-wrapper"></div>
          </body>
        </ShopProvider>
      </RelayEnvironmentProvider>
    </html>
  );
}
