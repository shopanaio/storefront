'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';
import {
  createThemeEditorStore,
  type ThemeEditorState,
  type ThemeEditorStore,
} from './store';

const ThemeEditorContext = createContext<ThemeEditorStore | null>(null);
const fallbackStore = createThemeEditorStore({});

export interface ThemeEditorLayoutProps {
  children: ReactNode;
  generalSettings: Record<string, unknown>;
}

/** Owns the live theme-editor state and is intended to sit in the theme layout. */
export function ThemeEditorLayout({
  children,
  generalSettings,
}: ThemeEditorLayoutProps) {
  const [store] = useState(() => createThemeEditorStore(generalSettings));

  return (
    <ThemeEditorContext.Provider value={store}>
      {children}
    </ThemeEditorContext.Provider>
  );
}

export function useThemeEditorStore<T>(
  selector: (state: ThemeEditorState) => T
): T {
  const store = useContext(ThemeEditorContext) ?? fallbackStore;
  return useStore(store, selector);
}

export function useThemeEditorGeneralSettings<
  TSettings extends object,
>(): TSettings {
  return useThemeEditorStore(
    (state) => state.generalSettings as unknown as TSettings
  );
}

export function useThemeEditorAvailable(): boolean {
  return useContext(ThemeEditorContext) !== null;
}
