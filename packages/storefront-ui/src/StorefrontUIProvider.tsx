'use client';

import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

/** Texts of the country picker of `PhoneInput` and `CountryPicker`. */
export interface CountryPickerTexts {
  /** Accessible name of the list, and of the control while no country is chosen. */
  title: string;
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
  /**
   * How a dialog (`ResponsiveDialog` from its breakpoint up) opens and closes: antd's `zoom`
   * by default, or `fade`.
   */
  dialogMotion?: DialogMotion;
  children: ReactNode;
}

/** Motion of a dialog: antd's default zoom or a fade. */
export type DialogMotion = 'zoom' | 'fade';

interface StorefrontUIValue {
  locale: string;
  texts: StorefrontUITexts;
  drawerContainer?: HTMLElement | null;
  dialogMotion: DialogMotion;
}

const DEFAULT_TEXTS: StorefrontUITexts = {
  dialog: 'Dialog',
  close: 'Close',
  dismiss: 'Close',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  countryPicker: {
    title: 'Choose a country',
    trigger: (country, callingCode) => `Country: ${country}, +${callingCode}`,
  },
};

const StorefrontUIContext = createContext<StorefrontUIValue>({
  locale: 'en',
  texts: DEFAULT_TEXTS,
  dialogMotion: 'zoom',
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
 *   texts={{ close: 'Close', countryPicker: { trigger: (country, code) => `${country}, +${code}` } }}
 * >
 *   {children}
 * </StorefrontUIProvider>
 * ```
 */
export function StorefrontUIProvider({
  locale,
  texts,
  drawerContainer,
  dialogMotion,
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
      dialogMotion: dialogMotion ?? parent.dialogMotion,
    }),
    [parent, locale, texts, drawerContainer, dialogMotion]
  );
  return (
    <StorefrontUIContext.Provider value={value}>
      {children}
    </StorefrontUIContext.Provider>
  );
}

/** Locale, texts, the drawer container and the dialog motion of the nearest provider. */
export const useStorefrontUI = () => useContext(StorefrontUIContext);

function definedOnly<T extends object>(value: T | undefined): Partial<T> {
  return Object.fromEntries(
    Object.entries(value ?? {}).filter(([, part]) => part !== undefined)
  ) as Partial<T>;
}
