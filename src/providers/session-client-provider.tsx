/**
 * Session Client Provider - SDK Integration
 *
 * This file re-exports SessionProvider from the SDK.
 * All session management logic has been moved to @shopana/storefront-sdk
 *
 * @deprecated Use SessionProvider directly from SDK instead
 * Session is now automatically managed inside SDK App component
 */

"use client";

import React, { type ReactNode } from "react";
import { createSessionStoreZustand } from '@shopana/storefront-sdk/modules/session/react/store/SessionStoreZustand';
import { SessionProvider as SDKSessionProvider } from '@shopana/storefront-sdk/modules/session/react';
import type { Session } from '@shopana/storefront-sdk/modules/session/core/types';

// Re-export everything from SDK
export {
  useSessionContext,
  type SessionContextValue,
  type SessionProviderProps,
} from '@shopana/storefront-sdk/modules/session/react';

// Backward compatible props type
export interface SessionStoreProviderProps {
  children: ReactNode;
  initialState?: {
    session?: Session | null;
  };
}

/**
 * Backward compatible SessionClientProvider
 * Creates per-tree session store instance (like CartProvider)
 */
export const SessionClientProvider: React.FC<SessionStoreProviderProps> = ({
  children,
  initialState,
}) => {
  // Create per-tree session store instance (no global singleton)
  const sessionStoreInstance = React.useRef<ReturnType<
    typeof createSessionStoreZustand
  > | null>(null);

  if (!sessionStoreInstance.current) {
    sessionStoreInstance.current = createSessionStoreZustand(
      initialState?.session ?? null
    );
  }

  return (
    <SDKSessionProvider store={sessionStoreInstance.current}>
      {children}
    </SDKSessionProvider>
  );
};

// Alias for SessionProvider
export const SessionProvider = SDKSessionProvider;
