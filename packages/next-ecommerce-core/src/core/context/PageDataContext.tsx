'use client';

import { createContext, type ReactNode } from 'react';
import type { PageType } from '../types';

export interface PageDataContextValue<TData = unknown> {
  pageType: PageType;
  data: TData;
}

export const PageDataContext = createContext<PageDataContextValue | null>(null);

export function PageDataProvider<TData>({
  value,
  children,
}: {
  value: PageDataContextValue<TData>;
  children: ReactNode;
}) {
  return <PageDataContext.Provider value={value}>{children}</PageDataContext.Provider>;
}
