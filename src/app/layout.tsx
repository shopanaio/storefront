import React from 'react';
import { AppProvider } from '@shopana/storefront-sdk';
import { mockShopConfig } from '@shopana/storefront-sdk/shop';
import { environmentConfig } from '@src/config/environment.config';
import { cartConfig } from '@src/config/cart.config';

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
      </head>
      <body>
        <div id="app">
          <AppProvider
            environmentConfig={environmentConfig}
            shopConfig={mockShopConfig}
            cartConfig={cartConfig}
          >
            {children}
          </AppProvider>
        </div>
        <div id="sheet-wrapper" />
      </body>
    </html>
  );
}
