'use client';

import { createContext, useContext, type ReactNode } from 'react';

export const PageContext = createContext<string | null>(null);
export const SectionContext = createContext<string | null>(null);
export const BlockContext = createContext<string | null>(null);

export interface PageContextProviderProps {
  pageId: string;
  children: ReactNode;
}

export interface SectionContextProviderProps {
  sectionId: string;
  children: ReactNode;
}

export interface BlockContextProviderProps {
  blockId: string;
  children: ReactNode;
}

export function PageContextProvider({ pageId, children }: PageContextProviderProps) {
  return <PageContext.Provider value={pageId}>{children}</PageContext.Provider>;
}

export function usePageContextId(): string | null {
  return useContext(PageContext);
}

export function SectionContextProvider({ sectionId, children }: SectionContextProviderProps) {
  return <SectionContext.Provider value={sectionId}>{children}</SectionContext.Provider>;
}

export function BlockContextProvider({ blockId, children }: BlockContextProviderProps) {
  return <BlockContext.Provider value={blockId}>{children}</BlockContext.Provider>;
}

export function useSectionContextId(): string | null {
  return useContext(SectionContext);
}

export function useBlockContextId(): string | null {
  return useContext(BlockContext);
}
