'use client';

import {
  Activity,
  createContext,
  startTransition,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';

/** The parts of a page in line to show, in the order of the document. */
export interface RevealQueue {
  /**
   * Puts a part in line; returns what takes it out when it unmounts: before its turn, or
   * while it is the one showing (the next one goes then).
   */
  add(element: Element, show: () => void): () => void;
  /**
   * The part is committed shown: the next may go. Only the part showing counts; a part shown
   * before (its effects mounted again, a screen uncovered) changes nothing.
   */
  shown(element: Element): void;
}

const ProgressiveContext = createContext<RevealQueue | null>(null);

export interface ProgressiveProviderProps {
  /** How many parts, from the top, show at once: what the screen shows first. */
  eager?: number;
  children: ReactNode;
}

/**
 * Shows the parts of a page one by one instead of all in one render, so the page answers taps
 * at once. Every DataBoundary inside (see ProgressiveReveal) takes its place in line, in the
 * order of the document. The first `eager` ones show at once; each of the others, until its
 * turn, has its skeleton in its place while React renders it in the background (a hidden
 * Activity renders in idle time, in slices that leave the thread to input), and shows once
 * the one above it is committed and the browser is idle again, in a transition: what the
 * background render has not done yet renders in slices too, never as one long task.
 *
 * For a page the browser renders: a server-rendered one has all of its parts in its HTML.
 */
export function ProgressiveProvider({
  eager = 2,
  children,
}: ProgressiveProviderProps) {
  const [queue] = useState(() => createRevealQueue(eager));
  return (
    <ProgressiveContext.Provider value={queue}>
      {children}
    </ProgressiveContext.Provider>
  );
}

/**
 * A part of the page in the line of the ProgressiveProvider around, `fallback` in its place
 * until its turn; the part alone without a provider.
 */
export function ProgressiveReveal({
  fallback,
  children,
}: {
  fallback: ReactNode;
  children: ReactNode;
}) {
  const queue = useContext(ProgressiveContext);
  if (!queue) return <>{children}</>;
  return (
    <QueuedReveal queue={queue} fallback={fallback}>
      {children}
    </QueuedReveal>
  );
}

function QueuedReveal({
  queue,
  fallback,
  children,
}: {
  queue: RevealQueue;
  fallback: ReactNode;
  children: ReactNode;
}) {
  const marker = useRef<HTMLTemplateElement>(null);
  const [shown, setShown] = useState(false);

  useLayoutEffect(() => {
    const element = marker.current;
    if (!element || shown) return;
    return queue.add(element, () => setShown(true));
    // In line once: showing takes it out.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue]);

  useLayoutEffect(() => {
    const element = marker.current;
    if (shown && element) queue.shown(element);
  }, [queue, shown]);

  return (
    <>
      {/* The part's place in the document, for the order: an empty element without a box,
          next to the part rather than around it, so the part stays a child of its page's
          container for the page's styles (`.sections > *`). */}
      <template ref={marker} />
      {shown ? null : fallback}
      {/* The same Activity before and after: what it rendered hidden is what shows. */}
      <Activity mode={shown ? 'visible' : 'hidden'}>{children}</Activity>
    </>
  );
}

/** Exported for its tests. */
export function createRevealQueue(eager: number): RevealQueue {
  const waiting = new Map<Element, () => void>();
  let shownCount = 0;
  // The part showing: set when its turn comes, cleared when it is committed or unmounts. A
  // flag would stay set for a part unmounted before its commit, and the line would stop.
  let current: Element | null = null;
  let scheduled = false;

  const inDocumentOrder = (a: Element, b: Element) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;

  const showFirst = () => {
    const eagerTurn = shownCount < eager;
    const [first] = [...waiting.keys()].sort(inDocumentOrder);
    if (!first) return false;
    const show = waiting.get(first)!;
    waiting.delete(first);
    shownCount += 1;
    current = first;
    if (eagerTurn) {
      // The top parts: synchronous, before the browser paints the page without them.
      flushSync(show);
    } else {
      // A transition: React renders what the background render has not done yet in slices,
      // leaving the thread to input, instead of one long task.
      startTransition(show);
    }
    return true;
  };

  const next = () => {
    if (current || scheduled || waiting.size === 0) return;
    scheduled = true;
    if (shownCount < eager) {
      // After the commit that put them in line, all of them: the top ones by their order.
      queueMicrotask(() => {
        scheduled = false;
        if (!current) showFirst();
      });
      return;
    }
    const run = () => {
      scheduled = false;
      if (!current) showFirst();
    };
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(run, { timeout: 1000 });
    } else {
      setTimeout(run, 50);
    }
  };

  return {
    add(element, show) {
      waiting.set(element, show);
      next();
      return () => {
        waiting.delete(element);
        if (current === element) {
          current = null;
          next();
        }
      };
    },
    shown(element) {
      // Shown already, it has no turn to wait for (put in line again after its screen was
      // hidden while it was showing).
      waiting.delete(element);
      if (element !== current) return;
      current = null;
      next();
    },
  };
}
