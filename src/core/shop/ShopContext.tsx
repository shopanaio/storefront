'use client';

import { createContext, type ReactNode } from 'react';
import type { ShopConfig } from './types';

/**
 * React Context for global shop configuration
 * Provides shop settings throughout the application
 */
export const ShopContext = createContext<ShopConfig | null>(null);

/**
 * Props for the ShopProvider component
 */
export interface ShopProviderProps {
  /** Shop configuration object */
  config: ShopConfig;
  /** Child components that will have access to shop context */
  children: ReactNode;
}

/**
 * ShopProvider - Global provider for shop configuration
 *
 * This component should wrap your entire application at the root level
 * to provide shop configuration to all components.
 *
 * @example
 * ```tsx
 * import { ShopProvider } from '@src/core/shop';
 * import { shopConfig } from '@src/config/shop';
 *
 * function App() {
 *   return (
 *     <ShopProvider config={shopConfig}>
 *       <YourApp />
 *     </ShopProvider>
 *   );
 * }
 * ```
 *
 * @param props - Component props
 * @returns Provider component wrapping children
 */
export function ShopProvider({ config, children }: ShopProviderProps) {
  return <ShopContext.Provider value={config}>{children}</ShopContext.Provider>;
}
