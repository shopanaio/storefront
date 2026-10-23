import en from './en.json';
import uk from './uk.json';

type Messages = Record<string, unknown>;

/** The checkout's own messages, by locale; English for a locale the checkout has none for. */
const MESSAGES: Record<string, Messages> = { en, uk };

export const DEFAULT_LOCALE = 'en';

export function checkoutMessages(locale: string): Messages {
  return (
    MESSAGES[locale] ??
    MESSAGES[locale.split('-')[0]] ??
    MESSAGES[DEFAULT_LOCALE]
  );
}

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
