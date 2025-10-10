'use client';

import { getCurrentEnvironment } from '@src/relay/Environment';
import Script from 'next/script';
import { RelayEnvironmentProvider } from 'react-relay';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Shopana</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" />
        <Script id="reset-hash" strategy="beforeInteractive">
          {`(function () {
            try {
              if (location.hash) {
                history.replaceState(null, "", location.pathname + location.search);
              }
            } catch (e) {}
          })();`}
        </Script>
      </head>
      <body>
        <RelayEnvironmentProvider environment={getCurrentEnvironment()}>
          {children}
        </RelayEnvironmentProvider>
        <div data-vaul-drawer-wrapper></div>
      </body>
    </html>
  );
}
