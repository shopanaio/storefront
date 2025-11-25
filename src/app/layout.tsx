import React from 'react';
import { App } from '@shopana/storefront-sdk';
import { mockShopConfig } from '@shopana/storefront-sdk/shop';
import { environmentConfig } from '@src/config/environment.config';
import { cartConfig } from '@src/config/cart.config';
import { loadCartSSR } from '@src/utils/cart/loadCartSSR';

console.error = () => {};
console.warn = () => {};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const preloadedCartQuery = await loadCartSSR();

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
          <App
            environmentConfig={environmentConfig}
            shopConfig={mockShopConfig}
            cartConfig={cartConfig}
            preloadedCartQuery={preloadedCartQuery}
          >
            {children}
          </App>
        </div>
        <div id="sheet-wrapper" />
      </body>
    </html>
  );
}
