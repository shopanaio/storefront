import { createContext, createElement, useContext } from 'react';
import type { ComponentType, ReactNode } from 'react';

export interface CheckoutThemeAdapter {
  Brand: ComponentType;
  Auth: ComponentType<{ className?: string }>;
  CartDrawer: ComponentType;
  useHomePath: () => string;
  /**
   * Locale-aware path of the checkout return page (`/checkout/return` module). The payment
   * provider sends the buyer there after paying.
   */
  useCheckoutReturnPath: () => string;
  /** Locale-aware path of the checkout page, used to go back from the return page. */
  useCheckoutPath: () => string;
  /**
   * Path of the placed order page, when the theme has one (decision 1.4). Returning `null`
   * hides the link on the result screen.
   */
  useOrderPath?: (orderId: string) => string | null;
  useOpenCart: () => () => void;
  /**
   * Place for loyalty next to the promo codes (decision 6.2). The checkout renders it as is;
   * full loyalty support is a separate task.
   */
  LoyaltySlot?: ComponentType;
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
