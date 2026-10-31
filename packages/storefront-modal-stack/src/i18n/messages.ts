'use client';

import { useLocale, useMessages } from 'next-intl';
import { useMemo } from 'react';
import { en } from './en';
import { ru } from './ru';
import { uk, type ModalStackMessages } from './uk';

export type { ModalStackMessages };

/** Namespace of the stack texts in next-intl; a theme overrides them in its own messages. */
export const MODAL_STACK_NAMESPACE = 'ModalStack';

const MESSAGES: Record<string, ModalStackMessages> = { uk, ru, en };

/** Default texts of a locale (`uk`, `uk-UA`, `ru`, `en`); English for any other. */
export function modalStackMessages(locale: string): ModalStackMessages {
  return (
    MESSAGES[locale] ?? MESSAGES[locale.split('-')[0] ?? ''] ?? MESSAGES.en
  );
}

/** Texts of the stack: the locale defaults with every key the host sets in `ModalStack`. */
export function useModalStackMessages(): ModalStackMessages {
  const locale = useLocale();
  const host = useMessages() as Record<string, unknown>;
  const overrides = host[MODAL_STACK_NAMESPACE];
  return useMemo(
    () => ({
      ...modalStackMessages(locale),
      ...(typeof overrides === 'object' && overrides !== null
        ? (overrides as Partial<ModalStackMessages>)
        : {}),
    }),
    [locale, overrides]
  );
}
