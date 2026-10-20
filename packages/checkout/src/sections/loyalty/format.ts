import { useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';

/** Points with the grouping of the locale, without losing digits of a large balance. */
export function formatPointsNumber(locale: string, points: string): string {
  try {
    return new Intl.NumberFormat(locale).format(BigInt(points));
  } catch {
    return points;
  }
}

/** Day and month of a date in the locale, e.g. `31.10`. */
export function formatShortDate(locale: string, date: Date): string {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' }).format(date);
}

/**
 * Text of an amount of points, e.g. "1 240 балів". The brand names its points in its own
 * messages (`loyalty-points`); the checkout does not know the name.
 */
export function usePointsLabel(): (points: string) => string {
  const t = useTranslations('Checkout');
  const locale = useLocale();
  return useCallback(
    (points: string) =>
      t('loyalty-points', {
        count: Number(points),
        points: formatPointsNumber(locale, points),
      }),
    [t, locale]
  );
}

/** Tier multiplier of purchase points, e.g. `×1.5`. */
export function formatMultiplier(locale: string, bps: number): string {
  return `×${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(bps / 10_000)}`;
}
