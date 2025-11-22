'use client';

import { createContext, useEffect, useRef, type ReactNode } from 'react';
import type { PageBuilderStore, PageTemplate } from './types';
import { createPageBuilderStore } from './store';

export const PageBuilderStoreContext = createContext<PageBuilderStore | null>(null);

export interface PageBuilderStoreProviderProps<TData = any> {
  template: PageTemplate<TData>;
  children: ReactNode;
}

export function PageBuilderStoreProvider<TData = any>({
  template,
  children,
}: PageBuilderStoreProviderProps<TData>) {
  const storeRef = useRef<PageBuilderStore<TData> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createPageBuilderStore<TData>(template);
    storeRef.current.getState().actions.initializeFromTemplate(template);
  }

  useEffect(() => {
    storeRef.current?.getState().actions.initializeFromTemplate(template);
  }, [template]);

  return (
    <PageBuilderStoreContext.Provider value={storeRef.current}>
      {children}
    </PageBuilderStoreContext.Provider>
  );
}
