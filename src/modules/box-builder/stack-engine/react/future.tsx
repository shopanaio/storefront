'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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
 * Configuration shape compatible with defineConfig in the original API.
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
export type ActivityComponentsMap = Record<string, React.ComponentType<{ params: any }>>;

/**
 * @public
 * Options accepted by stackflow factory.
 */
export interface StackflowOptions {
  config: StackflowConfig;
  components: ActivityComponentsMap;
  // Plugins are accepted for API compatibility, but ignored in this lightweight engine
  plugins?: unknown[];
}

/**
 * @public
 * Actions exposed to user-land to control navigation.
 */
export interface StackflowActions {
  /** Push a new activity on top of the stack */
  push: (name: string, params: any) => void;
  /** Replace the top activity with another one */
  replace: (name: string, params: any) => void;
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

type Direction = 'forward' | 'backward' | 'replace';

/**
 * Context with per-screen meta (e.g., isTop) so plugins (AppScreen) can render
 * elements outside animated area (like a static AppBar).
 */
export const ScreenContext = React.createContext<{ isTop: boolean; isRoot: boolean }>({ isTop: true, isRoot: true });
export const useScreenMeta = () => React.useContext(ScreenContext);

/**
 * @public
 * AppBar configuration that screens provide to the static AppBar host.
 */
export interface AppBarConfig {
  isRoot: boolean;
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}

/**
 * @public
 * Context to let top screen provide AppBar config to a static host rendered by Stack.
 */
export const AppBarHostContext = React.createContext<{
  setAppBar: (config: AppBarConfig | null) => void;
} | null>(null);

/**
 * @public
 * Hook to access AppBar host controller from within screens.
 */
export const useAppBarHost = () => {
  const ctx = React.useContext(AppBarHostContext);
  if (!ctx) {
    throw new Error('useAppBarHost must be used within a Stack component');
  }
  return ctx;
};

/**
 * Static AppBar component that stays mounted and only updates its content.
 * Renders with SSR support (works without JS).
 */
const StaticAppBar: React.FC<{ config: AppBarConfig | null }> = React.memo(({ config }) => {
  return (
    <div
      style={{
        height: 'var(--appbar-height)',
        display: 'flex',
        alignItems: 'center',
        paddingInline: 8,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        background: 'var(--appbar-bg, #fff)',
      }}
    >
      <div style={{ width: 40 }}>{config?.left}</div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{config?.center}</div>
      <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>{config?.right}</div>
    </div>
  );
});

StaticAppBar.displayName = 'StaticAppBar';

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
const generateKey = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

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
export function stackflow({ config, components }: StackflowOptions): StackflowOutput {
  const actions: StackflowActions = {
    push(name, params) {
      if (!controllerRef) return;
      controllerRef.setDirection('forward');
      schedule(() => {
        controllerRef?.setState((prev) => [...prev, { key: generateKey(), name, params }]);
      });
    },
    replace(name, params) {
      if (!controllerRef) return;
      const currentLength = controllerRef.getState().length;
      // If replacing the very first (root) screen, animate like a forward push
      controllerRef.setDirection(currentLength <= 1 ? 'forward' : 'replace');
      schedule(() => {
        controllerRef?.setState((prev) => {
          if (prev.length === 0) {
            return [{ key: generateKey(), name, params }];
          }
          const next = prev.slice(0, prev.length - 1);
          next.push({ key: generateKey(), name, params });
          return next;
        });
      });
    },
    pop() {
      if (!controllerRef) return;
      controllerRef.setDirection('backward');
      schedule(() => {
        controllerRef?.setState((prev) => (prev.length > 1 ? prev.slice(0, prev.length - 1) : prev));
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
    const [appBarConfig, setAppBarConfig] = useState<AppBarConfig | null>(null);

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

    // Render the entire stack; top-most is last
    return (
      <div style={{ position: 'relative', overflow: 'hidden', background: '#fff', height: '100vh' }}>
        {/* Static AppBar host above animated screens - always rendered, works without JS */}
        <div style={{ position: 'fixed', insetInline: 0, top: 0, zIndex: 1000 }}>
          <StaticAppBar config={appBarConfig} />
        </div>

        <AppBarHostContext.Provider value={{ setAppBar: setAppBarConfig }}>
          <AnimatePresence initial={false} mode="popLayout">
          {stack.map((entry, index) => {
            const Component = components[entry.name];
            if (!Component) return null;

            const isTop = index === stack.length - 1;
            const key = entry.key;
            const zIndex = index + 1;
            const motionSet =
              direction === 'forward'
                ? variants.enterFromRight
                : direction === 'backward'
                ? variants.enterFromLeft
                : variants.fadeSwap;

            return (
              <motion.div
                key={key}
                style={{
                  position: isTop ? 'relative' : 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  background: '#fff',
                  zIndex,
                  isolation: 'isolate',
                  pointerEvents: isTop ? 'auto' : 'none',
                  overflowY: isTop ? 'auto' : 'hidden',
                  WebkitOverflowScrolling: isTop ? 'touch' : undefined,
                }}
                initial={motionSet.initial}
                animate={motionSet.animate}
                exit={motionSet.exit}
              >
                <ScreenContext.Provider value={{ isTop, isRoot: index === 0 }}>
                  <Component params={entry.params} />
                </ScreenContext.Provider>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </AppBarHostContext.Provider>
      </div>
    );
  };

  return { Stack, actions };
}
