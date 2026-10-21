'use client';

import type { ReactNode } from 'react';
import { CheckoutIntlProvider } from '#checkout/i18n/CheckoutIntlProvider';
import { CheckoutThemeProvider } from '#checkout/theme';
import type { CheckoutThemeAdapter } from '#checkout/theme';

/** What every checkout page renders in: its messages and the theme over its defaults. */
export function CheckoutProviders({
  theme,
  children,
}: {
  theme?: CheckoutThemeAdapter;
  children: ReactNode;
}) {
  return (
    <CheckoutIntlProvider>
      <CheckoutThemeProvider theme={theme}>{children}</CheckoutThemeProvider>
    </CheckoutIntlProvider>
  );
}
