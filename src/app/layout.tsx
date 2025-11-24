import React from 'react';
import { ClientProviders } from './ClientProviders';
import { loadCartSSR } from '@src/utils/cart/loadCartSSR';

console.error = () => {};
console.warn = () => {};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const preloadedCartQuery = await loadCartSSR();

  console.log(
    'RootLayout preloadedCartQuery:',
    preloadedCartQuery?.response.data.checkoutQuery?.checkout
  );

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
          <ClientProviders preloadedCartQuery={preloadedCartQuery}>
            {children}
          </ClientProviders>
        </div>
        <div id="sheet-wrapper" />
      </body>
    </html>
  );
}
