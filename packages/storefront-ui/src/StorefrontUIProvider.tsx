'use client';

import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

/** Texts of the country picker of `PhoneInput` and `CountryPicker`. */
export interface CountryPickerTexts {
  /** Placeholder and accessible name of the search field. */
  search: string;
  /** Accessible name of the list and title of the sheet. */
  title: string;
  /** Shown when no country matches the search. */
  empty: string;
  /** Accessible name of the trigger, from the name of the selected country and its code. */
  trigger: (country: string, callingCode: string) => string;
}

/** Texts the components show or read out; English by default. */
export interface StorefrontUITexts {
  /** Name of a drawer or a sheet that has no title of its own. */
  dialog: string;
  /** Close button of a drawer. */
  close: string;
  /** Close button of a banner. */
  dismiss: string;
  /** Reveal button of `FloatingLabelPassword`. */
  showPassword: string;
  hidePassword: string;
  countryPicker: CountryPickerTexts;
}

export type StorefrontUITextOverrides = Partial<
  Omit<StorefrontUITexts, 'countryPicker'>
> & {
  countryPicker?: Partial<CountryPickerTexts>;
};

export interface StorefrontUIProviderProps {
  /** Locale of the country names (`uk`, `ru`, `en`); the parent's, else `en`. */
  locale?: string;
  /** Texts of the components; each one not set is the parent's, else English. */
  texts?: StorefrontUITextOverrides;
  /**
   * Element the drawers (`Sheet`, `DrawerBase`, the sheets of `ResponsiveDialog` and
   * `CountryPicker`) are portalled into; `document.body` by default. A host that scales its
   * page behind a drawer passes the wrapper of the page here.
   */
  drawerContainer?: HTMLElement | null;
  children: ReactNode;
}

interface StorefrontUIValue {
  locale: string;
  texts: StorefrontUITexts;
  drawerContainer?: HTMLElement | null;
}

const DEFAULT_TEXTS: StorefrontUITexts = {
  dialog: 'Dialog',
  close: 'Close',
  dismiss: 'Close',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  countryPicker: {
    search: 'Search country',
    title: 'Choose a country',
    empty: 'No countries found',
    trigger: (country, callingCode) => `Country: ${country}, +${callingCode}`,
  },
};

const StorefrontUIContext = createContext<StorefrontUIValue>({
  locale: 'en',
  texts: DEFAULT_TEXTS,
});

/**
 * Locale and texts of every storefront component under it, so a host translates them once
 * instead of at each call site. A provider inside another one changes only what it sets; a
 * component's own text props still win over both.
 *
 * @example
 * ```tsx
 * <StorefrontUIProvider
 *   locale="uk"
 *   texts={{ close: 'Закрити', countryPicker: { trigger: (country, code) => `${country}, +${code}` } }}
 * >
 *   {children}
 * </StorefrontUIProvider>
 * ```
 */
export function StorefrontUIProvider({
  locale,
  texts,
  drawerContainer,
  children,
}: StorefrontUIProviderProps) {
  const parent = useContext(StorefrontUIContext);
  const value = useMemo<StorefrontUIValue>(
    () => ({
      locale: locale ?? parent.locale,
      texts: {
        ...parent.texts,
        ...definedOnly(texts),
        countryPicker: {
          ...parent.texts.countryPicker,
          ...definedOnly(texts?.countryPicker),
        },
      },
      drawerContainer:
        drawerContainer === undefined
          ? parent.drawerContainer
          : drawerContainer,
    }),
    [parent, locale, texts, drawerContainer]
  );
  return (
    <StorefrontUIContext.Provider value={value}>
      {children}
    </StorefrontUIContext.Provider>
  );
}

/** Locale, texts and the drawer container of the nearest `StorefrontUIProvider`. */
export const useStorefrontUI = () => useContext(StorefrontUIContext);

function definedOnly<T extends object>(value: T | undefined): Partial<T> {
  return Object.fromEntries(
    Object.entries(value ?? {}).filter(([, part]) => part !== undefined)
  ) as Partial<T>;
}
