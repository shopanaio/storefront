'use client';

import { NextIntlClientProvider, useLocale, useMessages } from 'next-intl';
import { use } from 'react';
import type { ReactNode } from 'react';
import { loadMessages } from '#checkout/infra/loadCache';

type Messages = Record<string, unknown>;

/**
 * Gives a module its own messages under `Modules.<scope>`. It suspends until they are loaded,
 * so no message key flashes on screen and the nearest `LoadingBoundary` shows its skeleton
 * meanwhile; messages loaded before render at once. The host overrides the module's messages.
 * The checkout puts it around a module from the module's `messages` (see `ProviderRenderer`).
 */
export function ScopedIntlProvider({
  scope,
  load,
  scopePrefix = 'Modules',
  children,
}: {
  scope: string;
  load: (locale: string) => Promise<Messages>;
  scopePrefix?: string;
  children: ReactNode;
}) {
  const locale = useLocale();
  const base = useMessages() as Messages;
  const loaded = use(loadMessages(scope, locale, load));
  const currentScope = (base[scopePrefix] as Messages) ?? {};
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={{
        ...base,
        [scopePrefix]: {
          ...currentScope,
          [scope]: { ...loaded, ...((currentScope[scope] as Messages) ?? {}) },
        },
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
