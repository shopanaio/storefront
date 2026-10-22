'use client';

import { NextIntlClientProvider, useLocale, useMessages } from 'next-intl';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { AUTH_NAMESPACE, authMessages, mergeMessages } from './messages';

/**
 * Gives the sign-in screens their own texts (namespace `Auth`), so they work in a host that has
 * none. The host's messages override them key by key: a theme sets only the texts it changes.
 */
export function AuthIntlProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const host = useMessages() as Record<string, unknown>;
  const messages = useMemo(
    () =>
      mergeMessages(
        { [AUTH_NAMESPACE]: authMessages(locale) },
        host
      ),
    [locale, host]
  );
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
