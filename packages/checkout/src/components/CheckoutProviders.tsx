'use client';

import type { ThemeConfig } from 'antd';
import { ThemeProvider } from 'antd-style';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  StorefrontUIProvider,
  type StorefrontUITextOverrides,
} from '@shopana/storefront-ui';
import { CheckoutIntlProvider } from '#checkout/i18n/CheckoutIntlProvider';
import { CheckoutThemeProvider } from '#checkout/theme';
import type { CheckoutThemeAdapter } from '#checkout/theme';

/**
 * Type scale of the checkout: text one step over the antd default (15 and 13), with the large
 * and extra large sizes kept, so titles and the total stay as they are, secondary texts one
 * tone darker, and one corner radius. The rest of the tokens come from the host.
 */
const CHECKOUT_TOKENS: ThemeConfig = {
  token: {
    fontSize: 15,
    fontSizeSM: 13,
    fontSizeLG: 16,
    fontSizeXL: 20,
    // Secondary texts (hints, balances, terms) one tone darker than antd's, to read on the grey
    // summary: the tone of colorTextSecondary.
    colorTextDescription: 'rgba(0, 0, 0, 0.65)',
    // One corner for buttons, fields and panels whatever their size: antd rounds large controls
    // and panels (8) more than the others (6).
    borderRadius: 8,
    borderRadiusLG: 8,
  },
};

/** The checkout's texts of the shared components (drawers, banners, the country picker). */
function CheckoutUIProvider({ children }: { children: ReactNode }) {
  const t = useTranslations('Checkout');
  const locale = useLocale();
  const texts = useMemo<StorefrontUITextOverrides>(
    () => ({
      dialog: t('dialog'),
      close: t('close'),
      dismiss: t('banner-close'),
      countryPicker: {
        search: t('country-search'),
        title: t('country-choose'),
        empty: t('country-not-found'),
        trigger: (country, code) => t('country-trigger', { country, code }),
      },
    }),
    [t]
  );
  return (
    <StorefrontUIProvider locale={locale} texts={texts}>
      {children}
    </StorefrontUIProvider>
  );
}

/** What every checkout page renders in: its messages, its type scale and the theme over its defaults. */
export function CheckoutProviders({
  theme,
  children,
}: {
  theme?: CheckoutThemeAdapter;
  children: ReactNode;
}) {
  return (
    <CheckoutIntlProvider>
      <CheckoutUIProvider>
        <ThemeProvider theme={CHECKOUT_TOKENS}>
          <CheckoutThemeProvider theme={theme}>
            {children}
          </CheckoutThemeProvider>
        </ThemeProvider>
      </CheckoutUIProvider>
    </CheckoutIntlProvider>
  );
}
