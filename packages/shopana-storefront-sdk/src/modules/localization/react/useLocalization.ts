'use client';

import { useContext } from 'react';
import { LocalizationContext } from './LocalizationContext';

export function useLocalization() {
  const localization = useContext(LocalizationContext);

  if (!localization) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }

  return localization;
}

