"use client";

import * as React from "react";
import { NextIntlClientProvider, useLocale, useMessages } from "next-intl";

/**
 * Nested i18n provider that lazy-loads messages and mounts them under a scoped namespace.
 * Use in any feature/plugin/module to avoid polluting global messages.
 */
export function ScopedIntlProvider({
  scope,
  load,
  scopePrefix = "Modules",
  children,
}: {
  /** Scope name, e.g. "novaposta" | "boxBuilder" */
  scope: string;
  /** Async loader returning messages for given locale (plain object) */
  load: (locale: string) => Promise<Record<string, unknown>>;
  /** Top-level namespace used to mount scoped messages */
  scopePrefix?: string;
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const base = useMessages() as Record<string, unknown>;
  const [loaded, setLoaded] = React.useState<Record<string, unknown> | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoaded(null);
    load(locale).then((m) => {
      if (mounted) setLoaded(m);
    });
    return () => {
      mounted = false;
    };
  }, [locale, load]);

  if (!loaded) return <>{children}</>;

  const merged: Record<string, unknown> = {
    ...base,
    [scopePrefix]: {
      ...((base?.[scopePrefix] as Record<string, unknown>) ?? {}),
      [scope]: loaded,
    },
  };

  return (
    <NextIntlClientProvider locale={locale} messages={merged}>
      {children}
    </NextIntlClientProvider>
  );
}
