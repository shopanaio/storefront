'use client';

import {
  Activity,
  createContext,
  Suspense,
  useContext,
  useLayoutEffect,
  type ReactNode,
} from 'react';
import { holdQueryResults } from '../graphql/apollo/queryResultHold';
import { ProgressiveReveal } from './Progressive';

const DataGateContext = createContext(true);

export interface DataGateProps {
  /** False holds every DataBoundary inside on its fallback. */
  open: boolean;
  /**
   * How long a closed gate holds the results of queries back from the Apollo cache at most,
   * in ms: they are written once it opens, or after this.
   */
  maxHoldMs?: number;
  children: ReactNode;
}

/**
 * Holds back the data of the sections inside while closed: each DataBoundary shows its
 * fallback, even when the Apollo cache could answer its queries, and renders its section
 * hidden behind it, so the section's queries go to the network at once. Their results wait
 * for the gate to open before Apollo writes them to its cache (holdQueryResults), `maxHoldMs`
 * at most. An app opens it once the page can take Apollo's cache writes, e.g. after the screen
 * it sits on has animated in: the requests are on their way during the animation, nothing
 * writes or renders in the middle of it. Without a gate every boundary is open, as on the
 * server.
 */
export function DataGate({ open, maxHoldMs = 200, children }: DataGateProps) {
  // From the commit that closes it, before the hidden sections render and send their queries.
  useLayoutEffect(
    () => (open ? undefined : holdQueryResults(maxHoldMs)),
    [open, maxHoldMs]
  );
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
  children: ReactNode;
}

/**
 * Where a section loads its data: `fallback` shows while the DataGate around is closed and
 * while the children suspend on their queries. Once open, a query the Apollo cache already
 * answers does not suspend: the server render and hydration show the children at once. A
 * fallback may itself read the cache (cache-only) to show what is known before the query.
 *
 * While the gate is closed the children render hidden (a hidden Activity: in idle time, no
 * effects), so their queries start; the same Activity shows them once it opens, with what
 * the hidden render has done.
 *
 * Under a ProgressiveProvider the section waits its turn to show, `fallback` in its place
 * (see ProgressiveReveal).
 */
export function DataBoundary({ fallback, children }: DataBoundaryProps) {
  const open = useContext(DataGateContext);
  return (
    <>
      {open ? null : fallback}
      <Activity mode={open ? 'visible' : 'hidden'}>
        <ProgressiveReveal fallback={fallback}>
          <Suspense fallback={fallback}>{children}</Suspense>
        </ProgressiveReveal>
      </Activity>
    </>
  );
}
