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
 * Places in the checkout form where a theme adds its own content; nothing by default. Each is
 * rendered in the checkout's providers (its messages, the data of the checkout), so it can
 * read the checkout with the checkout hooks.
 */
export interface CheckoutSlots {
  /** Under the contact section, over the delivery (a newsletter opt-in, a note). */
  afterContact?: ComponentType;
  /**
   * Over the banner and the submit button. The actions stand in the form column on desktop
   * and under the summary on a phone: the slot is rendered with each of them, the one that is
   * not on screen hidden by CSS.
   */
  beforeActions?: ComponentType;
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
   * sign-in it opens is always the checkout's own (`@shopana/storefront-auth/ui`), restyled by
   * an `AuthUIProvider` of the host above the checkout; a `Legal` set there replaces the
   * checkout's consent.
   */
  Auth?: ComponentType<CheckoutAuthProps>;
  /**
   * Whether the store has customer accounts: the one switch of the sign-in in the checkout.
   * Only then the checkout shows "Log in", the sign-in drawer and the invitation to sign in for
   * the points the order earns. A store that takes orders from accounts only shows its sign-in
   * in place of the contact regardless.
   */
  customerAccountsEnabled?: boolean;
  /** What the theme adds to the checkout form. */
  slots?: CheckoutSlots;
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
  slots: CheckoutSlots;
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
  slots: {},
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
