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
    load(locale).then(
      (messages) => {
        if (mounted) setLoaded(messages);
      },
      (error) => {
        // Without its own messages the module falls back to those of the host, if any.
        console.error(`Failed to load the "${scope}" messages:`, error);
        if (mounted) setLoaded({});
      }
    );
    return () => {
      mounted = false;
    };
  }, [locale, load, scope]);

  const currentScope = (base[scopePrefix] as Record<string, unknown>) ?? {};
  if (!loaded) {
    // The host may ship the module messages itself; otherwise the module waits for its own,
    // so that no message key flashes on screen.
    return currentScope[scope] ? <>{children}</> : null;
  }
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={{
        ...base,
        [scopePrefix]: {
          ...currentScope,
          // The host overrides the module's own messages.
          [scope]: { ...loaded, ...((currentScope[scope] as Record<string, unknown>) ?? {}) },
        },
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
