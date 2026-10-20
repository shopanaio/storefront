import { createContext, createElement, useContext } from 'react';
import type { ComponentType, ReactNode } from 'react';

/** What the checkout passes to the theme's sign-in control. */
export interface CheckoutAuthProps {
  className?: string;
  status: 'loading' | 'authenticated' | 'anonymous';
  /** The signed-in buyer, shown as "signed in as". */
  user: { email: string; firstName?: string; lastName?: string } | null;
  /** A sign-in or sign-out is in progress. */
  pending: boolean;
  /** Saves the pending input of the checkout, then leaves for the sign-in. */
  onSignIn: () => void;
  onSignOut: () => void;
}

export interface CheckoutThemeAdapter {
  Brand: ComponentType;
  Auth: ComponentType<CheckoutAuthProps>;
  /** Whether the store has customer accounts; the checkout offers sign-in only then. */
  customerAccountsEnabled: boolean;
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
