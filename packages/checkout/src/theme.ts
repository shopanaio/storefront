import { createContext, createElement, useContext } from 'react';
import type { ComponentType, ReactNode } from 'react';

export interface CheckoutThemeAdapter {
  Brand: ComponentType;
  Auth: ComponentType<{ className?: string }>;
  CartDrawer: ComponentType;
  useHomePath: () => string;
  useOpenCart: () => () => void;
}

const CheckoutThemeContext = createContext<CheckoutThemeAdapter | null>(null);

export function CheckoutThemeProvider({
  theme,
  children,
}: {
  theme: CheckoutThemeAdapter;
  children: ReactNode;
}) {
  return createElement(CheckoutThemeContext.Provider, { value: theme }, children);
}

export function useCheckoutTheme(): CheckoutThemeAdapter {
  const theme = useContext(CheckoutThemeContext);
  if (!theme) {
    throw new Error('Checkout must be rendered with a CheckoutThemeAdapter.');
  }
  return theme;
}
