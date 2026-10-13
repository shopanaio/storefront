'use client';

import { NextIntlClientProvider, useLocale, useMessages } from 'next-intl';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export function ScopedIntlProvider({
  scope,
  load,
  scopePrefix = 'Modules',
  children,
}: {
  scope: string;
  load: (locale: string) => Promise<Record<string, unknown>>;
  scopePrefix?: string;
  children: ReactNode;
}) {
  const locale = useLocale();
  const base = useMessages() as Record<string, unknown>;
  const [loaded, setLoaded] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoaded(null);
    load(locale).then((messages) => {
      if (mounted) setLoaded(messages);
    });
    return () => {
      mounted = false;
    };
  }, [locale, load]);

  if (!loaded) return <>{children}</>;
  const currentScope = (base[scopePrefix] as Record<string, unknown>) ?? {};
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={{ ...base, [scopePrefix]: { ...currentScope, [scope]: loaded } }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
