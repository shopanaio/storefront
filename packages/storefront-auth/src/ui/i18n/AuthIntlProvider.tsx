'use client';

import {
  NextIntlClientProvider,
  useLocale,
  useMessages,
  useTranslations,
} from 'next-intl';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  StorefrontUIProvider,
  type StorefrontUITextOverrides,
} from '@shopana/storefront-ui';
import { AUTH_NAMESPACE, authMessages, mergeMessages } from './messages';

/**
 * Gives the sign-in screens their own texts (namespace `Auth`), so they work in a host that has
 * none. The host's messages override them key by key: a theme sets only the texts it changes.
 */
export function AuthIntlProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const host = useMessages() as Record<string, unknown>;
  const messages = useMemo(
    () => mergeMessages({ [AUTH_NAMESPACE]: authMessages(locale) }, host),
    [locale, host]
  );
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthUITexts locale={locale}>{children}</AuthUITexts>
    </NextIntlClientProvider>
  );
}

/** The sign-in's texts of the shared fields and drawers, given once for every screen. */
function AuthUITexts({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  const t = useTranslations('Auth.common');
  const texts = useMemo<StorefrontUITextOverrides>(
    () => ({
      close: t('close'),
      showPassword: t('showPassword'),
      hidePassword: t('hidePassword'),
      countryPicker: {
        title: t('country.title'),
        trigger: (country, code) => t('country.trigger', { country, code }),
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
