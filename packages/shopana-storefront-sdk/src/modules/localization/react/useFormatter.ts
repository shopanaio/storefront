'use client';

import { useMemo } from 'react';
import { createFormatter, type StorefrontFormatter } from '../core/formatter';
import { useLocalization } from './useLocalization';

/** Money, number and date formatting in the active locale and the store timezone. */
export function useFormatter(): StorefrontFormatter {
  const { intlLocale, timeZone } = useLocalization();
  return useMemo(
    () => createFormatter({ locale: intlLocale, timeZone }),
    [intlLocale, timeZone]
  );
}
