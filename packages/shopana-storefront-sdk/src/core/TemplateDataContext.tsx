'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import type { PageType } from './types';

export interface TemplateDataContextValue<TData = any> {
  pageType: PageType;
  data: TData;
}

const TemplateDataContext =
  createContext<TemplateDataContextValue | null>(null);

export interface TemplateDataProviderProps<TData> {
  value: TemplateDataContextValue<TData>;
  children: ReactNode;
}

export function TemplateDataProvider<TData>({
  value,
  children,
}: TemplateDataProviderProps<TData>) {
  return (
    <TemplateDataContext.Provider value={value}>
      {children}
    </TemplateDataContext.Provider>
  );
}

export function useTemplateData<TData = any>() {
  const ctx = useContext(TemplateDataContext);

  if (!ctx) {
    throw new Error(
      'useTemplateData must be used within TemplateDataProvider',
    );
  }

  return ctx as TemplateDataContextValue<TData>;
}

