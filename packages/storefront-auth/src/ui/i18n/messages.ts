import { en } from './en';
import { ru } from './ru';
import { uk, type AuthMessages } from './uk';

export type { AuthMessages };

/** Namespace of the sign-in texts in next-intl; a theme overrides them in its own messages. */
export const AUTH_NAMESPACE = 'Auth';

const MESSAGES: Record<string, AuthMessages> = { uk, ru, en };

/** Default texts of a locale (`uk`, `uk-UA`, `ru`, `en`); English for any other. */
export function authMessages(locale: string): AuthMessages {
  return (
    MESSAGES[locale] ?? MESSAGES[locale.split('-')[0] ?? ''] ?? MESSAGES.en
  );
}

type Messages = Record<string, unknown>;

const isObject = (value: unknown): value is Messages =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** `base` with every message `overrides` sets, at any depth. */
export function mergeMessages(base: Messages, overrides: Messages): Messages {
  const merged: Messages = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    const current = merged[key];
    merged[key] =
      isObject(current) && isObject(value)
        ? mergeMessages(current, value)
        : value;
  }
  return merged;
}
