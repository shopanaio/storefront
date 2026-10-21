'use client';

import type { ThemeConfig } from 'antd';
import { ThemeProvider } from 'antd-style';
import type { ReactNode } from 'react';
import { CheckoutIntlProvider } from '#checkout/i18n/CheckoutIntlProvider';
import { CheckoutThemeProvider } from '#checkout/theme';
import type { CheckoutThemeAdapter } from '#checkout/theme';

/**
 * Type scale of the checkout: text one step over the antd default (15 and 13), with the large
 * and extra large sizes kept, so titles and the total stay as they are, and secondary texts one
 * tone darker. The rest of the tokens come from the host.
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
  },
};

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
      <ThemeProvider theme={CHECKOUT_TOKENS}>
        <CheckoutThemeProvider theme={theme}>{children}</CheckoutThemeProvider>
      </ThemeProvider>
    </CheckoutIntlProvider>
  );
}
