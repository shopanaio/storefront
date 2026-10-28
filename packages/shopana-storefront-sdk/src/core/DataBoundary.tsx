'use client';

import { createContext, Suspense, useContext, type ReactNode } from 'react';
import { AwayBoundary, useAwayEnabled } from './AwayBoundary';
import { ProgressiveReveal } from './Progressive';

const DataGateContext = createContext(true);

export interface DataGateProps {
  /** False holds every DataBoundary inside on its fallback. */
  open: boolean;
  children: ReactNode;
}

/**
 * Holds back the data of the sections inside while closed: each DataBoundary shows its
 * fallback and renders nothing that could start a query, even when the Apollo cache could
 * answer it. An app opens it once the page can take Apollo's cache writes, e.g. after the
 * screen it sits on has animated in. Without a gate every boundary is open, as on the server.
 */
export function DataGate({ open, children }: DataGateProps) {
  return (
    <DataGateContext.Provider value={open}>{children}</DataGateContext.Provider>
  );
}

/** Whether the DataGate around is open; true without one. */
export function useDataGateOpen(): boolean {
  return useContext(DataGateContext);
}

export interface DataBoundaryProps {
  /** The section as far as it can render without its queries: a skeleton, or cached data. */
  fallback: ReactNode;
  /**
   * Freeze the section while it is away from the screen (see AwayBoundary), `fallback` at its
   * last height in its place. By default as an AwayProvider around says (off without one).
   */
  away?: boolean;
  children: ReactNode;
}

/**
 * Where a section loads its data: `fallback` shows while the DataGate around is closed and
 * while the children suspend on their queries. Once open, a query the Apollo cache already
 * answers does not suspend: the server render and hydration show the children at once. A
 * fallback may itself read the cache (cache-only) to show what is known before the query.
 *
 * Under a ProgressiveProvider the section waits its turn to show, `fallback` in its place
 * (see ProgressiveReveal); under an AwayProvider it freezes while away from the screen.
 */
export function DataBoundary({
  fallback,
  away: ownAway,
  children,
}: DataBoundaryProps) {
  const open = useContext(DataGateContext);
  const providedAway = useAwayEnabled();
  const away = ownAway ?? providedAway;
  if (!open) return <>{fallback}</>;
  const section = <Suspense fallback={fallback}>{children}</Suspense>;
  return (
    <ProgressiveReveal fallback={fallback}>
      {away ? (
        <AwayBoundary placeholder={fallback}>{section}</AwayBoundary>
      ) : (
        section
      )}
    </ProgressiveReveal>
  );
}
