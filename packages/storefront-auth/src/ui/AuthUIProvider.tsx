'use client';

import { createContext, useContext, useMemo } from 'react';
import type { ComponentType, CSSProperties, ReactNode } from 'react';
import type { SocialProviderView } from './parts/providers';
import { DefaultDivider } from './parts/Divider';
import { DefaultLegal } from './parts/Legal';
import { DefaultMethodTabs } from './parts/MethodTabs';
import { DefaultSocialButtons } from './parts/SocialButtons';

/**
 * Parts of every sign-in screen a theme can restyle with `classNames` and `styles`, for all
 * screens at once.
 */
export type AuthPart =
  | 'root'
  | 'header'
  | 'title'
  | 'alert'
  | 'tabs'
  | 'field'
  | 'submit'
  | 'divider'
  | 'social'
  | 'legal'
  | 'footer';

export interface SocialButtonsProps {
  providers: readonly SocialProviderView[];
  onSelect: (provider: string) => void;
  /** Sign-in or sign-up screen: changes the accessible names only. */
  intent: 'signIn' | 'signUp';
  /** Accessible name of the group. */
  label: string;
  /** Accessible name of a provider button. */
  buttonLabel: (provider: SocialProviderView) => string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface DividerProps {
  /** "or". */
  label: string;
  className?: string;
  style?: CSSProperties;
}

export interface LegalProps {
  /** Terms of use and privacy policy of the store; plain text without them. */
  links: AuthLegalLinks;
  className?: string;
  style?: CSSProperties;
}

export type AuthMethodTab = 'phone' | 'email';

export interface MethodTabsProps {
  value: AuthMethodTab;
  onChange: (value: AuthMethodTab) => void;
  items: readonly { value: AuthMethodTab; label: string }[];
  /** Accessible name of the tab list. */
  label: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface AuthLegalLinks {
  terms?: string;
  privacy?: string;
}

/**
 * Parts a theme replaces where tokens are not enough. Fields, the phone and the drawer are not
 * among them: they are shared with the checkout (`@shopana/storefront-ui`).
 */
export interface AuthUIComponents {
  SocialButtons: ComponentType<SocialButtonsProps>;
  Divider: ComponentType<DividerProps>;
  /** Logo in the header of a store card; none by default. */
  Logo: ComponentType;
  Legal: ComponentType<LegalProps>;
  MethodTabs: ComponentType<MethodTabsProps>;
}

export interface AuthUIProviderProps {
  classNames?: Partial<Record<AuthPart, string>>;
  styles?: Partial<Record<AuthPart, CSSProperties>>;
  components?: Partial<AuthUIComponents>;
  /** Pages of the legal note under the forms. */
  legalLinks?: AuthLegalLinks;
  children: ReactNode;
}

interface AuthUIValue {
  classNames: Partial<Record<AuthPart, string>>;
  styles: Partial<Record<AuthPart, CSSProperties>>;
  components: AuthUIComponents;
  legalLinks: AuthLegalLinks;
}

const Nothing = () => null;

const DEFAULT_COMPONENTS: AuthUIComponents = {
  SocialButtons: DefaultSocialButtons,
  Divider: DefaultDivider,
  Logo: Nothing,
  Legal: DefaultLegal,
  MethodTabs: DefaultMethodTabs,
};

const DEFAULT_VALUE: AuthUIValue = {
  classNames: {},
  styles: {},
  components: DEFAULT_COMPONENTS,
  legalLinks: {},
};

const AuthUIContext = createContext<AuthUIValue>(DEFAULT_VALUE);

/**
 * What a theme changes in the sign-in screens without touching their logic: `classNames` and
 * `styles` of the parts, and a fixed set of `components`. Colors, fonts and sizes come from the
 * antd `ConfigProvider` above it.
 *
 * @example
 * ```tsx
 * <ConfigProvider theme={brandTheme}>
 *   <AuthUIProvider classNames={{ submit: 'brand-cta' }} components={{ SocialButtons, Divider }}>
 *     {children}
 *   </AuthUIProvider>
 * </ConfigProvider>
 * ```
 */
export function AuthUIProvider({
  classNames,
  styles,
  components,
  legalLinks,
  children,
}: AuthUIProviderProps) {
  // Inside another provider (the theme's), only what this one sets changes.
  const parent = useContext(AuthUIContext);
  const value = useMemo<AuthUIValue>(
    () => ({
      classNames: { ...parent.classNames, ...classNames },
      styles: { ...parent.styles, ...styles },
      components: { ...parent.components, ...definedOnly(components) },
      legalLinks: { ...parent.legalLinks, ...definedOnly(legalLinks) },
    }),
    [parent, classNames, styles, components, legalLinks]
  );
  return (
    <AuthUIContext.Provider value={value}>{children}</AuthUIContext.Provider>
  );
}

function definedOnly<T extends object>(value: Partial<T> | undefined): Partial<T> {
  return Object.fromEntries(
    Object.entries(value ?? {}).filter(([, part]) => part !== undefined)
  ) as Partial<T>;
}

export function useAuthUI() {
  const value = useContext(AuthUIContext);
  return useMemo(
    () => ({
      ...value,
      /** `className` and `style` a theme set for the part, merged with the screen's own. */
      part: (name: AuthPart, own?: string) => ({
        className:
          [own, value.classNames[name]].filter(Boolean).join(' ') || undefined,
        style: value.styles[name],
      }),
    }),
    [value]
  );
}
