'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { ComponentType, CSSProperties, ReactNode } from 'react';
import type { SocialProviderView } from './parts/providers';
import { DefaultDivider } from './parts/Divider';
import { DefaultLegal } from './parts/Legal';
import { DefaultMethodTabs } from './parts/MethodTabs';
import { DefaultPasswordRules } from './parts/PasswordRules';
import { DefaultSocialButtons } from './parts/SocialButtons';

/**
 * Parts of every sign-in screen a theme can restyle with `classNames` and `styles`, for all
 * screens at once.
 */
export type AuthPart =
  /** The column of a screen. */
  | 'root'
  /** The header of a store card: back and the logo. */
  | 'header'
  | 'title'
  /** The line under the title. */
  | 'subtitle'
  /** The round icon of the step over the title. */
  | 'badge'
  /** Where the code or the link went, with its change action. */
  | 'chip'
  | 'alert'
  | 'tabs'
  | 'form'
  | 'field'
  /** The cells of a one-time code. */
  | 'codeCells'
  /** The rules a new password must pass. */
  | 'rules'
  | 'submit'
  /** A text action of the flow ("Forgot password?", "Send again"). */
  | 'textAction'
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
  /** The privacy policy of the store; the note is plain text without it. */
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

/** A rule of a new password and whether the typed one passes it. */
export interface PasswordRule {
  key: string;
  label: string;
  /** Not checked yet (nothing typed), passed, or failed. */
  state: 'pending' | 'passed' | 'failed';
}

export interface PasswordRulesProps {
  /** The password field is described by it. */
  id: string;
  rules: readonly PasswordRule[];
  className?: string;
  style?: CSSProperties;
}

export interface AuthLegalLinks {
  /** Page of the privacy policy, linked from the consent to the personal data processing. */
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
  PasswordRules: ComponentType<PasswordRulesProps>;
}

export type AuthHeadingLevel = 1 | 2 | 3 | 4 | 5;

export interface AuthUIProviderProps {
  classNames?: Partial<Record<AuthPart, string>>;
  styles?: Partial<Record<AuthPart, CSSProperties>>;
  components?: Partial<AuthUIComponents>;
  /** Pages of the legal note under the forms. */
  legalLinks?: AuthLegalLinks;
  /** Level of the screen titles in the page outline; 2 by default. */
  headingLevel?: AuthHeadingLevel;
  children: ReactNode;
}

interface AuthUIValue {
  classNames: Partial<Record<AuthPart, string>>;
  styles: Partial<Record<AuthPart, CSSProperties>>;
  components: AuthUIComponents;
  legalLinks: AuthLegalLinks;
  headingLevel: AuthHeadingLevel;
}

const Nothing = () => null;

const DEFAULT_COMPONENTS: AuthUIComponents = {
  SocialButtons: DefaultSocialButtons,
  Divider: DefaultDivider,
  Logo: Nothing,
  Legal: DefaultLegal,
  MethodTabs: DefaultMethodTabs,
  PasswordRules: DefaultPasswordRules,
};

const DEFAULT_VALUE: AuthUIValue = {
  classNames: {},
  styles: {},
  components: DEFAULT_COMPONENTS,
  legalLinks: {},
  headingLevel: 2,
};

const AuthUIContext = createContext<AuthUIValue>(DEFAULT_VALUE);

/**
 * What a theme changes in the sign-in screens without touching their logic: `classNames` and
 * `styles` of the parts, and a fixed set of `components`. Colors, fonts and sizes come from the
 * antd `ConfigProvider` above it.
 *
 * Objects written inline are fine: the provider compares them by their entries (and the
 * entries of `styles` one level down), so the screens re-render only when a value changes.
 * Pass components defined outside the render, not inline functions.
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
  headingLevel,
  children,
}: AuthUIProviderProps) {
  // Inside another provider (the theme's), only what this one sets changes.
  const parent = useContext(AuthUIContext);
  const stableClassNames = useStableEntries(classNames, 1);
  const stableStyles = useStableEntries(styles, 2);
  const stableComponents = useStableEntries(components, 1);
  const stableLinks = useStableEntries(legalLinks, 1);
  const value = useMemo<AuthUIValue>(
    () => ({
      classNames: { ...parent.classNames, ...stableClassNames },
      styles: { ...parent.styles, ...stableStyles },
      components: { ...parent.components, ...definedOnly(stableComponents) },
      legalLinks: { ...parent.legalLinks, ...definedOnly(stableLinks) },
      headingLevel: headingLevel ?? parent.headingLevel,
    }),
    [
      parent,
      stableClassNames,
      stableStyles,
      stableComponents,
      stableLinks,
      headingLevel,
    ]
  );
  return (
    <AuthUIContext.Provider value={value}>{children}</AuthUIContext.Provider>
  );
}

/** The last value with the same entries (`depth` levels down), so an inline object is stable. */
function useStableEntries<T extends object | undefined>(
  value: T,
  depth: number
): T {
  const [kept, setKept] = useState(value);
  if (!sameEntries(kept, value, depth)) {
    setKept(value);
    return value;
  }
  return kept;
}

function sameEntries(a: unknown, b: unknown, depth: number): boolean {
  if (Object.is(a, b)) return true;
  if (depth === 0 || !isRecord(a) || !isRecord(b)) return false;
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) => key in b && sameEntries(a[key], b[key], depth - 1))
  );
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function definedOnly<T extends object>(
  value: Partial<T> | undefined
): Partial<T> {
  return Object.fromEntries(
    Object.entries(value ?? {}).filter(([, part]) => part !== undefined)
  ) as Partial<T>;
}

export function useAuthUI() {
  const value = useContext(AuthUIContext);
  return useMemo(
    () => ({
      ...value,
      /**
       * `className` and `style` a theme set for the part, merged with the screen's own; the
       * theme's style wins.
       */
      part: (
        name: AuthPart,
        own?: string | false,
        ownStyle?: CSSProperties
      ) => ({
        className:
          [own, value.classNames[name]].filter(Boolean).join(' ') || undefined,
        style:
          ownStyle || value.styles[name]
            ? { ...ownStyle, ...value.styles[name] }
            : undefined,
      }),
    }),
    [value]
  );
}
