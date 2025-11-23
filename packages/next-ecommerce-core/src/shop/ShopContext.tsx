'use client';

import type { ReactNode } from 'react';
import { createContext } from 'react';

import type { ShopConfig } from './types';

export const ShopContext = createContext<ShopConfig | null>(null);

export interface ShopProviderProps {
  config: ShopConfig;
  children: ReactNode;
}

export function ShopProvider({ config, children }: ShopProviderProps) {
  return (
    <ShopContext.Provider value={config}>{children}</ShopContext.Provider>
  );
}

