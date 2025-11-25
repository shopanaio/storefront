/**
 * Session Server Provider - SDK Integration
 *
 * Loads session data on server and provides it to the app via QueryProvider
 */

import { loadSessionServerQuery } from "@shopana/storefront-sdk/modules/session/next";
import { environmentConfig } from "@src/config/environment.config";
import { QueryProvider } from "@src/providers/relay-query-provider";

export async function SessionServerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load session data on server
  const preloadedSessionQuery = await loadSessionServerQuery({
    environmentConfig,
  });

  return (
    <QueryProvider preloadedQuery={preloadedSessionQuery}>
      {children}
    </QueryProvider>
  );
}
