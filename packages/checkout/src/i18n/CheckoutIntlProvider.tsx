'use client';

import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { NextIntlClientProvider, useLocale, useMessages } from 'next-intl';
import { checkoutMessages, mergeMessages } from './messages';

/**
 * Gives the checkout its own messages, so it works in a host that has none of them. The host's
 * messages override them key by key: a theme sets only the texts it changes, e.g. the name of
 * its points in `Checkout.loyalty-points`.
 */
export function CheckoutIntlProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const host = useMessages() as Record<string, unknown>;
  const messages = useMemo(
    () => mergeMessages(checkoutMessages(locale), host),
    [locale, host]
  );
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
