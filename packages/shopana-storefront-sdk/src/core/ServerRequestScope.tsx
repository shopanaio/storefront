'use client';

import { createContext, useContext, type ReactNode } from 'react';
import {
  getServerRequestScope,
  type ServerRequestHeaders,
  type ServerRequestScope,
} from '../server/requestScope';

/**
 * The request a server render renders for, held by React: work React resumes after a
 * suspension (a lazy chunk, a query) may run outside the request's async context, but a
 * context value stays. Null in the browser, and under Next.js (its own request APIs).
 */
const ServerRequestScopeContext = createContext<ServerRequestScope | null>(
  null
);

/** Set by a runtime's server entry around the app it renders (React Router). */
export function ServerRequestScopeProvider({
  scope,
  children,
}: {
  scope: ServerRequestScope | null;
  children: ReactNode;
}) {
  return (
    <ServerRequestScopeContext.Provider value={scope}>
      {children}
    </ServerRequestScopeContext.Provider>
  );
}

/** The scope of the request being rendered on the server; null in the browser. */
export function useServerRequestScope(): ServerRequestScope | null {
  return (
    useContext(ServerRequestScopeContext) ?? getServerRequestScope() ?? null
  );
}

/**
 * The headers of the request being rendered on the server (after the runtime middleware);
 * null in the browser, where the browser's own values (`navigator`) are the same request's.
 */
export function useServerRequestHeaders(): ServerRequestHeaders | null {
  return useServerRequestScope()?.headers ?? null;
}
