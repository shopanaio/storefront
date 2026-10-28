'use client';

import {
  Activity,
  createContext,
  startTransition,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useScrollRoot } from './ScrollRoot';

const AwayContext = createContext(false);

/**
 * Turns AwayBoundary on for every DataBoundary inside, in one place instead of each section:
 * an app sets it around its pages. A DataBoundary's own `away` prop overrides it (`false`
 * keeps that section as it is).
 */
export function AwayProvider({ children }: { children: ReactNode }) {
  return <AwayContext.Provider value={true}>{children}</AwayContext.Provider>;
}

/** Whether an AwayProvider is around. */
export function useAwayEnabled(): boolean {
  return useContext(AwayContext);
}

export interface AwayBoundaryProps {
  /** What holds the part's place while it is away: its skeleton, at the part's last height. */
  placeholder: ReactNode;
  /** How far from the screen the part still counts as near (IntersectionObserver). */
  rootMargin?: string;
  children: ReactNode;
}

/**
 * Freezes a part of the page while it is away from the screen. The part goes into a hidden
 * React Activity: its state and DOM stay, its effects (subscriptions, listeners, timers) are
 * removed, and its updates render only when the browser idles. A hidden Activity is
 * `display: none`, so its place is held by `placeholder` at the part's last height: nothing
 * collapses, and scrolled to before the part is live again, the place shows the skeleton
 * rather than nothing.
 *
 * Only a part that has shown is frozen (its height is known), never during hydration. Near
 * the screen again (with `rootMargin` to spare) it comes back live in a transition: the
 * placeholder stays until the live part is committed, in the same commit.
 */
export function AwayBoundary({
  placeholder,
  rootMargin = '100% 0px',
  children,
}: AwayBoundaryProps) {
  const root = useScrollRoot();
  const outerRef = useRef<HTMLDivElement>(null);
  // State, not a ref: an Activity is a hydration boundary of its own, its content may hydrate
  // after this component's effects ran, and they must run again once it is there.
  const [live, setLive] = useState<HTMLDivElement | null>(null);
  const height = useRef<number | null>(null);
  const [away, setAway] = useState(false);

  // The part's height while it is live; a hidden screen around reports none and is ignored.
  useEffect(() => {
    if (away || !live) return;
    const observer = new ResizeObserver(([entry]) => {
      const size =
        entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
      if (size > 0) height.current = size;
    });
    observer.observe(live);
    return () => observer.disconnect();
  }, [away, live]);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startTransition(() => setAway(false));
          return;
        }
        // No box: the part is hidden by something around it (a covered screen), not away.
        if (entry.boundingClientRect.height === 0 || height.current === null) {
          return;
        }
        startTransition(() => setAway(true));
      },
      { root, rootMargin }
    );
    observer.observe(outer);
    return () => observer.disconnect();
  }, [root, rootMargin]);

  return (
    <div ref={outerRef}>
      {away ? (
        <div
          style={{ height: height.current ?? undefined, overflow: 'hidden' }}
          aria-hidden
        >
          {placeholder}
        </div>
      ) : null}
      <Activity mode={away ? 'hidden' : 'visible'}>
        <div ref={setLive}>{children}</div>
      </Activity>
    </div>
  );
}
