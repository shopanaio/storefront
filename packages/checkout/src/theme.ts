import { createContext, createElement, useContext, useMemo } from 'react';
import { DefaultCheckoutAuth } from '#checkout/components/DefaultCheckoutAuth';
import type { ComponentType, ReactNode } from 'react';

/** What the checkout passes to the theme's sign-in control. */
export interface CheckoutAuthProps {
  className?: string;
  status: 'loading' | 'authenticated' | 'anonymous';
  /** The signed-in buyer; `identifier` is what they signed in with, shown as "signed in as". */
  user: {
    email: string;
    firstName?: string;
    lastName?: string;
    identifier: string;
  } | null;
  /** A sign-out is in progress, or the account cart is being attached after a sign-in. */
  pending: boolean;
  /** Opens the sign-in of the checkout. */
  onSignIn: () => void;
  onSignOut: () => void;
}

/**
 * What a theme changes in the checkout. Every field is optional: the checkout works without a
 * theme, and a theme sets only what it needs (its logo, its cart, locale-aware paths).
 */
export interface CheckoutThemeAdapter {
  /** Logo above the form; none by default. */
  Brand?: ComponentType;
  /**
   * "Log in" / "Log out" control next to the contact section; the checkout has its own. The
   * sign-in it opens is always the checkout's own (`@shopana/storefront-auth/ui`).
   */
  Auth?: ComponentType<CheckoutAuthProps>;
  /** Whether the store has customer accounts; the checkout offers sign-in only then. */
  customerAccountsEnabled?: boolean;
  /** Cart drawer of the store, opened by `useOpenCart`. */
  CartDrawer?: ComponentType;
  useHomePath?: () => string;
  /**
   * Path of the checkout return page (`/checkout/return` module). The payment provider sends
   * the buyer there after paying.
   */
  useCheckoutReturnPath?: () => string;
  /** Path of the checkout page, used to go back from the return page. */
  useCheckoutPath?: () => string;
  /**
   * Path of the placed order page, when the theme has one (decision 1.4). Returning `null`
   * hides the link on the result screen.
   */
  useOrderPath?: (orderId: string) => string | null;
  /** Opens the store cart. Without it the checkout offers no cart. */
  useOpenCart?: () => () => void;
}

/** The theme the checkout renders with: the adapter over the checkout defaults. */
export interface CheckoutTheme {
  Brand: ComponentType;
  Auth: ComponentType<CheckoutAuthProps>;
  customerAccountsEnabled: boolean;
  CartDrawer: ComponentType;
  useHomePath: () => string;
  useCheckoutReturnPath: () => string;
  useCheckoutPath: () => string;
  useOrderPath: (orderId: string) => string | null;
  /** `null` when the theme has no cart. */
  useOpenCart: () => (() => void) | null;
}

const Nothing = () => null;

const DEFAULT_THEME: CheckoutTheme = {
  Brand: Nothing,
  Auth: DefaultCheckoutAuth,
  customerAccountsEnabled: false,
  CartDrawer: Nothing,
  useHomePath: () => '/',
  useCheckoutReturnPath: () => '/checkout/return',
  useCheckoutPath: () => '/checkout',
  useOrderPath: () => null,
  useOpenCart: () => null,
};

/** The checkout defaults with what the theme sets. */
export function resolveCheckoutTheme(adapter: CheckoutThemeAdapter = {}): CheckoutTheme {
  const defined = Object.fromEntries(
    Object.entries(adapter).filter(([, value]) => value !== undefined)
  ) as Partial<CheckoutTheme>;
  return { ...DEFAULT_THEME, ...defined };
}

const CheckoutThemeContext = createContext<CheckoutTheme>(DEFAULT_THEME);

export function CheckoutThemeProvider({
  theme,
  children,
}: {
  theme?: CheckoutThemeAdapter;
  children: ReactNode;
}) {
  const value = useMemo(() => resolveCheckoutTheme(theme), [theme]);
  return createElement(CheckoutThemeContext.Provider, { value }, children);
}

/** The theme of the checkout; the defaults when no theme is given. */
export function useCheckoutTheme(): CheckoutTheme {
  return useContext(CheckoutThemeContext);
}
