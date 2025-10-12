'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/* ============================================================================
 * Types & Interfaces
 * ========================================================================== */

/**
 * @public
 * Activity component type facade. Matches usage in codebase: a component that
 * receives a single `params` prop.
 */
export type ActivityComponentType<P = unknown> = React.ComponentType<{
  params: P;
}>;

/**
 * @public
 * A single stack entry that represents an activity pushed on the stack.
 */
export interface StackEntry<Params = unknown> {
  /** Unique key for React rendering */
  key: string;
  /** Activity name */
  name: string;
  /** Params passed to the activity component */
  params: Params;
}

/**
 * @public
 * Configuration for stackflow.
 */
export interface StackflowConfig {
  activities: Array<{ name: string; route?: string }>;
  transitionDuration?: number;
  initialActivity: () => string;
}

/**
 * @public
 * Components map keyed by activity name.
 */
export type ActivityComponentsMap = Record<
  string,
  React.ComponentType<{ params: any }>
>;

/**
 * @public
 * Options accepted by stackflow factory.
 */
export interface StackflowOptions {
  config: StackflowConfig;
  components: ActivityComponentsMap;
}

/**
 * @public
 * Actions exposed to user-land to control navigation.
 */
export interface StackflowActions {
  /** Push a new activity on top of the stack */
  push: (name: string, params: any) => void;
  /**
   * Replace the top activity with another one.
   * @param name - Activity name to push
   * @param params - Activity params
   * @param keepActivityKeys - Optional array of activity names to keep in the stack below the new activity
   */
  replace: (name: string, params: any, keepActivityKeys?: string[]) => void;
  /** Pop the top activity from the stack */
  pop: () => void;
}

/**
 * @public
 * The output returned from the stackflow factory function.
 */
export interface StackflowOutput {
  Stack: React.ComponentType;
  actions: StackflowActions;
}

/**
 * @public
 * AppScreen component props
 */
export interface AppScreenProps {
  appBar?: {
    closeButton?: { render?: () => React.ReactNode };
    backButton?: { render?: () => React.ReactNode };
    title?: React.ReactNode;
    renderRight?: () => React.ReactNode;
  };
  ANDROID_ONLY_activityEnterStyle?: 'slideInLeft' | 'slideInRight' | string;
  children?: React.ReactNode;
}

type Direction = 'forward' | 'backward' | 'replace';

/* ============================================================================
 * Contexts
 * ========================================================================== */

/**
 * Context with per-screen meta (e.g., isTop) so plugins (AppScreen) can render
 * elements outside animated area (like a static AppBar).
 */
export const ScreenContext = React.createContext<{
  isTop: boolean;
  isRoot: boolean;
  zIndex: number;
  motionProps?: {
    initial: any;
    animate: any;
    exit: any;
  };
}>({
  isTop: true,
  isRoot: true,
  zIndex: 1,
});

export const useScreenMeta = () => React.useContext(ScreenContext);

/* ============================================================================
 * Internal Controller
 * ========================================================================== */

/**
 * Internal controller used by actions to mutate the mounted stack component.
 */
interface StackController {
  getState: () => ReadonlyArray<StackEntry>;
  setState: React.Dispatch<React.SetStateAction<ReadonlyArray<StackEntry>>>;
  setDirection: (dir: Direction) => void;
}

let controllerRef: StackController | null = null;

/**
 * Generate unique keys for stack entries.
 */
const generateKey = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Schedule a state update to the next frame to ensure direction is applied
 * before elements mount/unmount, so exit/enter animations use correct variants.
 */
const schedule = (fn: () => void) => {
  if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
    requestAnimationFrame(() => fn());
  } else {
    setTimeout(fn, 0);
  }
};

/* ============================================================================
 * Components
 * ========================================================================== */

/**
 * @public
 * Minimal AppScreen compatible facade used by Layout.tsx
 */
export const AppScreen = React.memo(function AppScreen({
  appBar,
  children,
}: AppScreenProps) {
  const APP_BAR_HEIGHT = 56; // px
  const { isRoot, motionProps, isTop, zIndex } = useScreenMeta();

  const leftContent = useMemo(
    () => (isRoot ? appBar?.closeButton?.render?.() : appBar?.backButton?.render?.()),
    [isRoot, appBar]
  );

  const appBarStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      height: APP_BAR_HEIGHT,
      display: 'flex',
      alignItems: 'center',
      paddingInline: 8,
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      background: '#fff',
      zIndex: zIndex + 1000,
    }),
    [zIndex]
  );

  const contentStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      top: APP_BAR_HEIGHT,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      background: '#fff',
      zIndex,
      overflow: 'auto',
      pointerEvents: (isTop ? 'auto' : 'none') as 'auto' | 'none',
      WebkitOverflowScrolling: 'touch' as const,
      // contain: 'layout paint' as const,
      // willChange: 'transform, opacity' as const,
    }),
    [zIndex, isTop]
  );

  return (
    <>
      {/* AppBar rendered inside the screen */}
      <div style={appBarStyle}>
        <div style={{ width: 40 }}>{leftContent}</div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {appBar?.title}
        </div>
        <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>
          {appBar?.renderRight?.()}
        </div>
      </div>
      {/* Content wrapped in motion.div */}
      <motion.div style={contentStyle} {...motionProps}>
        {children}
      </motion.div>
    </>
  );
});

/* ============================================================================
 * Main Stackflow Factory
 * ========================================================================== */

/**
 * Create motion variants based on navigation direction.
 */
const useVariants = (durationMs: number) => {
  const duration = Math.max(0, durationMs) / 1000; // seconds
  return useMemo(
    () => ({
      enterFromRight: {
        initial: { x: '100%', opacity: 0 },
        animate: { x: 0, opacity: 1, transition: { duration } },
        exit: { x: '-20%', opacity: 0, transition: { duration } },
      },
      enterFromLeft: {
        initial: { x: '-20%', opacity: 0 },
        animate: { x: 0, opacity: 1, transition: { duration } },
        exit: { x: '100%', opacity: 0, transition: { duration } },
      },
      fadeSwap: {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration } },
        exit: { opacity: 0, transition: { duration } },
      },
    }),
    [duration]
  );
};

/**
 * Factory that returns a React Stack component and imperative actions.
 * This is a lightweight reimplementation compatible with the minimal API used in the codebase.
 */
export function stackflow({
  config,
  components,
}: StackflowOptions): StackflowOutput {
  const actions: StackflowActions = {
    push(name, params) {
      if (!controllerRef) return;
      controllerRef.setDirection('forward');
      schedule(() => {
        controllerRef?.setState((prev) => [
          ...prev,
          { key: generateKey(), name, params },
        ]);
      });
    },
    replace(name, params, keepActivityKeys) {
      if (!controllerRef) return;
      const currentLength = controllerRef.getState().length;
      // If replacing the very first (root) screen, animate like a forward push
      controllerRef.setDirection(currentLength <= 1 ? 'forward' : 'replace');
      schedule(() => {
        controllerRef?.setState((prev) => {
          if (prev.length === 0) {
            return [{ key: generateKey(), name, params }];
          }

          let base: StackEntry[];
          if (keepActivityKeys && keepActivityKeys.length > 0) {
            // Keep only activities with names in the keepActivityKeys array
            base = prev.filter((entry) => keepActivityKeys.includes(entry.name));
          } else {
            // Default behavior: keep all activities except the top one
            base = prev.slice(0, prev.length - 1);
          }

          return [...base, { key: generateKey(), name, params }];
        });
      });
    },
    pop() {
      if (!controllerRef) return;
      controllerRef.setDirection('backward');
      schedule(() => {
        controllerRef?.setState((prev) =>
          prev.length > 1 ? prev.slice(0, prev.length - 1) : prev
        );
      });
    },
  };

  /**
   * The Stack component hosts the animated activity stack.
   */
  const Stack: React.FC = () => {
    const [stack, setStack] = useState<ReadonlyArray<StackEntry>>(() => [
      { key: generateKey(), name: config.initialActivity(), params: {} },
    ]);
    const [direction, setDirection] = useState<Direction>('forward');

    // Keep the controllerRef in sync with the mounted stack
    useEffect(() => {
      controllerRef = {
        getState: () => stack,
        setState: setStack,
        setDirection,
      };
      return () => {
        controllerRef = null;
      };
    }, [stack]);

    const variants = useVariants(config.transitionDuration ?? 350);

    // Render only the top-most screen; AnimatePresence will keep the previous
    // one mounted just for its exit animation when it gets removed.
    return (
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#fff',
          height: '100dvh',
          contain: 'layout paint',
        }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {(() => {
            const topIndex = stack.length - 1;
            const entry = stack[topIndex];
            if (!entry) return null;

            const Component = components[entry.name];
            if (!Component) return null;

            const motionSet =
              direction === 'forward'
                ? variants.enterFromRight
                : direction === 'backward'
                  ? variants.enterFromLeft
                  : variants.fadeSwap;

            return (
              <ScreenContext.Provider
                key={entry.key}
                value={{
                  isTop: true,
                  isRoot: topIndex === 0,
                  motionProps: {
                    initial: motionSet.initial,
                    animate: motionSet.animate,
                    exit: motionSet.exit,
                  },
                  zIndex: topIndex + 1,
                }}
              >
                <Component params={entry.params} />
              </ScreenContext.Provider>
            );
          })()}
        </AnimatePresence>
      </div>
    );
  };

  return { Stack, actions };
}
