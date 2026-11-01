'use client';

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

/** True without a provider: an app no server rendered has nothing to hydrate. */
const HydratedContext = createContext(true);

/**
 * The app's one flag of having left the server's render behind, set in a transition. An update
 * of any other kind, reaching a part of the page React has not hydrated yet, makes React hydrate
 * that part at once, in one long task. A store's update is such an update
 * (`useSyncExternalStore` renders synchronously), so a value that differs from the server's
 * stays the server's until this flag is set.
 */
export function HydratedProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    startTransition(() => setHydrated(true));
  }, []);
  return (
    <HydratedContext.Provider value={hydrated}>
      {children}
    </HydratedContext.Provider>
  );
}

/** False on the server and while hydrating, true once the app runs in the browser. */
export const useHydrated = () => useContext(HydratedContext);
