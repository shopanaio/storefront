import React from 'react';
import { App } from './App';
import { loadAppProps, type LoadAppPropsOptions } from './server/app';

export type { AppPreloadConfig } from './server/app';

export interface AppProviderProps extends LoadAppPropsOptions {
  children: React.ReactNode;
}

/**
 * App Provider (Next.js Server Component)
 *
 * Loads the root data of the request (`loadAppProps`) and hands it to the client providers.
 *
 * @example
 * ```tsx
 * <AppProvider
 *   environmentConfig={environmentConfig}
 *   routing={{ localePrefix: 'as-needed' }}
 *   cartConfig={cartConfig}
 *   preload={{ navigationMenus: ['main-menu', 'footer'] }}
 * >
 *   {children}
 * </AppProvider>
 * ```
 */
export async function AppProvider({ children, ...options }: AppProviderProps) {
  const props = await loadAppProps(options);

  return (
    <App
      environmentConfig={options.environmentConfig}
      cartConfig={options.cartConfig}
      {...props}
    >
      {children}
    </App>
  );
}
