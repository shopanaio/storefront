import Script from 'next/script';
import type { ReactNode } from 'react';
import { historyGateScript } from '@shopana/storefront-sdk/routing';
import { getRequestContext } from './headers';
import { InitialLocationProvider } from './initial-location';
import { UnclaimedMoves } from './page-rendering';

/**
 * The storefront history (SDK, TanStack history) as the only router on the client; goes
 * around the app in the root layout. The gate script (`beforeInteractive`, run before
 * hydration) cuts the Next router off from the browser history, so after the first page the
 * Next router takes no part in navigation. The navigation hooks answer with the requested
 * address until the history is read, and a move no storefront page or app renders loads from the server.
 *
 * What follows from it:
 * - Moves on a module page (the checkout: no storefront page around it) load from the server,
 *   query changes included; so do links and router moves to a module page from anywhere.
 * - The Next router's own state stays on the first page. A server action that redirects or
 *   revalidates works against that page; server actions are not part of client navigation.
 */
export async function StorefrontHistory({ children }: { children: ReactNode }) {
  const { pathname, search } = await getRequestContext();
  return (
    <>
      <Script id="shopana-history-gate" strategy="beforeInteractive">
        {historyGateScript}
      </Script>
      <UnclaimedMoves />
      <InitialLocationProvider href={`${pathname}${search}`}>
        {children}
      </InitialLocationProvider>
    </>
  );
}
